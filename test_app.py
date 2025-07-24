import unittest
import os

class TestApp(unittest.TestCase):

    def test_page_ai_crew_import(self):
        # Set a dummy API key to prevent the ValueError
        os.environ["OPENROUTER_API_KEY"] = "dummy_key"
        try:
            from page_ai_crew import page_ai_crew
        except Exception as e:
            self.fail(f"Failed to import page_ai_crew: {e}")

if __name__ == '__main__':
    unittest.main()
