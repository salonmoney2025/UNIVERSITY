using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using MudBlazor.Services;
using University.Infrastructure.Data;
using University.Infrastructure.Identity;
using University.Web.Components;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents();

// Configure Database
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    // PostgreSQL for production, SQL Server for development
    if (connectionString.Contains("Host=") || connectionString.Contains("postgres"))
        options.UseNpgsql(connectionString);
    else
        options.UseSqlServer(connectionString);
});

// Configure ASP.NET Core Identity
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    // Password settings (VibeSec: Strong passwords)
    options.Password.RequiredLength = 8;
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = true;

    // User settings
    options.User.RequireUniqueEmail = true;
    options.SignIn.RequireConfirmedAccount = false; // Set to true in production

    // Lockout settings (VibeSec: Prevent brute force)
    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
    options.Lockout.MaxFailedAccessAttempts = 5;
    options.Lockout.AllowedForNewUsers = true;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();

// Configure authentication cookie (VibeSec: Secure cookies)
builder.Services.ConfigureApplicationCookie(options =>
{
    options.LoginPath = "/Account/Login";
    options.LogoutPath = "/Account/Logout";
    options.AccessDeniedPath = "/Account/AccessDenied";
    options.ExpireTimeSpan = TimeSpan.FromHours(8);
    options.SlidingExpiration = true;
    options.Cookie.HttpOnly = true; // VibeSec: Prevent XSS
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always; // VibeSec: HTTPS only
    options.Cookie.SameSite = SameSiteMode.Strict; // VibeSec: CSRF protection
});

// Add authorization policies
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("SuperAdminOnly", policy => policy.RequireRole("SuperAdmin"));
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin", "SuperAdmin"));
    options.AddPolicy("FacultyOnly", policy => policy.RequireRole("Faculty", "Admin", "SuperAdmin"));
    options.AddPolicy("StudentOnly", policy => policy.RequireRole("Student", "Faculty", "Admin", "SuperAdmin"));
});

// Add HttpContextAccessor
builder.Services.AddHttpContextAccessor();

// Add MudBlazor
builder.Services.AddMudServices();

// Add cascading authentication state
builder.Services.AddCascadingAuthenticationState();

// Add security headers (VibeSec: Defense-in-depth)
builder.Services.AddHsts(options =>
{
    options.MaxAge = TimeSpan.FromDays(365);
    options.IncludeSubDomains = true;
    options.Preload = true;
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}
else
{
    app.UseExceptionHandler("/Error", createScopeForErrors: true);
    app.UseHsts();
}

app.UseStatusCodePagesWithReExecute("/NotFound", createScopeForStatusCodePages: true);
app.UseHttpsRedirection();

// VibeSec: Security headers
app.Use(async (context, next) =>
{
    context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
    context.Response.Headers.Append("X-Frame-Options", "DENY");
    context.Response.Headers.Append("X-XSS-Protection", "1; mode=block");
    context.Response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");
    context.Response.Headers.Append("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
    await next();
});

app.UseAuthentication();
app.UseAuthorization();

app.UseAntiforgery();

app.MapStaticAssets();
app.MapRazorComponents<App>()
    .AddInteractiveServerRenderMode();

// Seed database with default roles and admin user
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();
        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();

        // Apply migrations
        if (context.Database.IsNpgsql() || context.Database.IsSqlServer())
        {
            context.Database.Migrate();
        }

        // Seed roles
        string[] roles = { "SuperAdmin", "Admin", "Faculty", "Student", "Staff" };
        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole(role));
            }
        }

        // Seed default admin user
        var adminEmail = "admin@university.edu";
        var adminUser = await userManager.FindByEmailAsync(adminEmail);
        if (adminUser == null)
        {
            adminUser = new ApplicationUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                FirstName = "Super",
                LastName = "Admin",
                EmailConfirmed = true,
                IsActive = true
            };

            var result = await userManager.CreateAsync(adminUser, "Admin@123!");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(adminUser, "SuperAdmin");
            }
        }
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while migrating or seeding the database.");
    }
}

app.Run();
