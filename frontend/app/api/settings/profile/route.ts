import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

// Mock database - in production, this would connect to your actual database
const userProfiles = new Map();

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify token
    const user = verifyToken(token);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get user profile from database (mock data for now)
    const profile = userProfiles.get(user.userId) || {
      // Personal Information
      title: 'Mr.',
      firstName: user.name?.split(' ')[0] || 'John',
      middleName: '',
      lastName: user.name?.split(' ')[1] || 'Doe',
      gender: 'Male',
      dateOfBirth: '1990-01-01',
      nationality: 'Sierra Leonean',
      idNumber: '',

      // Contact Information
      email: user.email,
      phoneNumber: '',
      alternatePhone: '',
      address: '',
      city: 'Freetown',
      state: 'Western Area',
      country: 'Sierra Leone',
      postalCode: '',

      // Emergency Contact
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactRelationship: '',

      // Professional Information
      department: '',
      position: user.role || 'Staff',
      employeeId: user.userId,
      dateJoined: '2024-01-01',
      campus: 'Main Campus - Makeni',
      faculty: '',

      // Additional
      bio: '',
      profilePhoto: ''
    };

    return NextResponse.json({
      success: true,
      profile
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify token
    const user = verifyToken(token);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get form data
    const formData = await request.formData();

    // Extract profile data
    const profileData: any = {};

    // Personal Information
    profileData.title = formData.get('title') as string;
    profileData.firstName = formData.get('firstName') as string;
    profileData.middleName = formData.get('middleName') as string;
    profileData.lastName = formData.get('lastName') as string;
    profileData.gender = formData.get('gender') as string;
    profileData.dateOfBirth = formData.get('dateOfBirth') as string;
    profileData.nationality = formData.get('nationality') as string;
    profileData.idNumber = formData.get('idNumber') as string;

    // Contact Information
    profileData.email = formData.get('email') as string;
    profileData.phoneNumber = formData.get('phoneNumber') as string;
    profileData.alternatePhone = formData.get('alternatePhone') as string;
    profileData.address = formData.get('address') as string;
    profileData.city = formData.get('city') as string;
    profileData.state = formData.get('state') as string;
    profileData.country = formData.get('country') as string;
    profileData.postalCode = formData.get('postalCode') as string;

    // Emergency Contact
    profileData.emergencyContactName = formData.get('emergencyContactName') as string;
    profileData.emergencyContactPhone = formData.get('emergencyContactPhone') as string;
    profileData.emergencyContactRelationship = formData.get('emergencyContactRelationship') as string;

    // Professional Information (read-only, but include in profile)
    profileData.department = formData.get('department') as string;
    profileData.position = formData.get('position') as string;
    profileData.employeeId = formData.get('employeeId') as string;
    profileData.dateJoined = formData.get('dateJoined') as string;
    profileData.campus = formData.get('campus') as string;
    profileData.faculty = formData.get('faculty') as string;

    // Additional
    profileData.bio = formData.get('bio') as string;

    // Handle profile photo upload
    const photoFile = formData.get('profilePhoto') as File;
    if (photoFile && photoFile.size > 0) {
      // In production, upload to storage service (S3, Cloudinary, etc.)
      // For now, we'll just acknowledge it
      console.log('Profile photo uploaded:', photoFile.name, photoFile.size);
      // profileData.profilePhoto = 'https://example.com/photos/user-id.jpg';
    }

    // Validate required fields
    if (!profileData.firstName || !profileData.lastName || !profileData.email) {
      return NextResponse.json(
        { success: false, message: 'Required fields are missing' },
        { status: 400 }
      );
    }

    // Save to database (mock)
    userProfiles.set(user.userId, profileData);

    console.log('Profile updated for user:', user.userId);

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      profile: profileData
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
