"""
Scrape Ernest Bai Koroma University Portal
Extract structure, modules, and features
"""

from scrapling import Fetcher
import json

def scrape_university_portal():
    """Scrape the university portal to understand its structure"""

    print("=" * 70)
    print("SCRAPING ERNEST BAI KOROMA UNIVERSITY PORTAL")
    print("=" * 70)

    try:
        fetcher = Fetcher()

        # Fetch the main portal page
        print("\n[1] Fetching main portal page...")
        response = fetcher.get('https://portal.ebkustsl.edu.sl/')

        print(f"Status Code: {response.status}")
        print(f"URL: {response.url}")

        # Extract page title
        title = response.css('title::text').get()
        print(f"\nPage Title: {title}")

        # Extract all headings
        print("\n[2] Extracting Page Structure:")
        print("-" * 70)

        headings = {
            'h1': response.css('h1::text').getall(),
            'h2': response.css('h2::text').getall(),
            'h3': response.css('h3::text').getall(),
        }

        for tag, texts in headings.items():
            if texts:
                print(f"\n{tag.upper()} Headings:")
                for text in texts:
                    if text.strip():
                        print(f"  - {text.strip()}")

        # Extract navigation/menu items
        print("\n[3] Extracting Navigation/Menu Items:")
        print("-" * 70)

        nav_links = response.css('nav a::text').getall()
        menu_links = response.css('.menu a::text, .nav a::text, [role="navigation"] a::text').getall()

        all_links = list(set(nav_links + menu_links))
        if all_links:
            for link in all_links:
                if link.strip():
                    print(f"  - {link.strip()}")
        else:
            print("  No navigation items found in standard locations")

        # Extract all links
        print("\n[4] Extracting All Links:")
        print("-" * 70)

        all_hrefs = response.css('a::attr(href)').getall()
        unique_hrefs = list(set([href for href in all_hrefs if href and not href.startswith('#')]))[:20]

        for href in unique_hrefs:
            print(f"  - {href}")

        # Extract form fields (login, etc.)
        print("\n[5] Extracting Forms:")
        print("-" * 70)

        forms = response.css('form')
        print(f"Found {len(forms)} form(s)")

        for i, form in enumerate(forms):
            print(f"\nForm {i+1}:")
            inputs = form.css('input')
            for inp in inputs:
                input_type = inp.css('::attr(type)').get() or 'text'
                input_name = inp.css('::attr(name)').get() or 'unnamed'
                input_placeholder = inp.css('::attr(placeholder)').get() or ''
                print(f"  - {input_type}: {input_name} {f'({input_placeholder})' if input_placeholder else ''}")

        # Extract meta information
        print("\n[6] Meta Information:")
        print("-" * 70)

        meta_description = response.css('meta[name="description"]::attr(content)').get()
        meta_keywords = response.css('meta[name="keywords"]::attr(content)').get()

        if meta_description:
            print(f"Description: {meta_description}")
        if meta_keywords:
            print(f"Keywords: {meta_keywords}")

        # Extract main content sections
        print("\n[7] Main Content Sections:")
        print("-" * 70)

        # Try to find main content areas
        main_content = response.css('main, .main-content, .content, #content')
        if main_content:
            print(f"Found {len(main_content)} main content area(s)")

        # Extract any visible text from the body
        print("\n[8] Body Text Preview (first 1000 chars):")
        print("-" * 70)

        body_text = response.css('body::text').getall()
        combined_text = ' '.join([t.strip() for t in body_text if t.strip()])
        print(combined_text[:1000] + "..." if len(combined_text) > 1000 else combined_text)

        # Save raw HTML for analysis
        print("\n[9] Saving Raw HTML...")
        with open('portal_page.html', 'w', encoding='utf-8') as f:
            f.write(response.text)
        print("Saved to: portal_page.html")

        print("\n" + "=" * 70)
        print("SCRAPING COMPLETE")
        print("=" * 70)

    except Exception as e:
        print(f"\nError during scraping: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    scrape_university_portal()
