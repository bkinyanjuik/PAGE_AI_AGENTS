from github import Github
import os
from typing import Dict, List, Optional

class GitHubTool:
    def __init__(self):
        self.github = Github(os.getenv("GITHUB_TOKEN"))
        
    def create_issue(self, repo_name: str, title: str, body: str, labels: Optional[List[str]] = None) -> Dict:
        """Create a new issue in the specified repository"""
        try:
            repo = self.github.get_repo(repo_name)
            issue = repo.create_issue(title=title, body=body, labels=labels)
            return {
                "status": "success",
                "issue_number": issue.number,
                "url": issue.html_url
            }
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def create_pull_request(self, repo_name: str, title: str, body: str, head: str, base: str = "main") -> Dict:
        """Create a new pull request"""
        try:
            repo = self.github.get_repo(repo_name)
            pr = repo.create_pull(title=title, body=body, head=head, base=base)
            return {
                "status": "success",
                "pr_number": pr.number,
                "url": pr.html_url
            }
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def get_code_review(self, repo_name: str, pr_number: int) -> Dict:
        """Get code review comments for a PR"""
        try:
            repo = self.github.get_repo(repo_name)
            pr = repo.get_pull(pr_number)
            reviews = pr.get_reviews()
            return {
                "status": "success",
                "reviews": [
                    {
                        "reviewer": review.user.login,
                        "state": review.state,
                        "body": review.body
                    } for review in reviews
                ]
            }
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def list_repos(self) -> List[str]:
        """List all accessible repositories"""
        try:
            return [repo.full_name for repo in self.github.get_user().get_repos()]
        except Exception as e:
            return {"status": "error", "message": str(e)}
