from playwright.sync_api import sync_playwright

def verify_app():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            # Wait for Expo to start (simple sleep or retry loop)
            page.goto("http://localhost:8081")

            # Wait for content to load
            page.wait_for_selector('text=Welcome back', timeout=30000)

            # Take screenshot of Home
            page.screenshot(path="verification/home_screen.png")
            print("Home Screen captured")

            # Navigate to Bible
            # Expo web tabs might need specific selectors.
            # We used Ionicons 'book-outline' or 'book' for Bible tab.
            # Finding tab by text might be tricky if it's icon only or styling issues.
            # Let's try to click by text 'Bible' if it exists in tab bar labels.
            # Our Tab Navigator has names 'Home', 'Study', 'Bible', 'Profile'.
            # Usually react-navigation-bottom-tabs renders text labels by default.

            # Try to click Bible tab
            page.get_by_text("Bible", exact=True).click()
            page.wait_for_selector('text=Genesis 1')
            page.screenshot(path="verification/bible_screen.png")
            print("Bible Screen captured")

            # Navigate to Voice Center (Profile)
            page.get_by_text("Voice Center", exact=True).click()
            page.wait_for_selector('text=Voice Cloning Center')
            page.screenshot(path="verification/voice_screen.png")
            print("Voice Screen captured")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_app()
