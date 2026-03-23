# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e2]:
    - heading "TIC Trainer V2" [level=1] [ref=e3]
    - generic [ref=e4]:
      - heading "Sign in (Firebase)" [level=2] [ref=e5]
      - paragraph [ref=e6]: The API requires a real Firebase ID token. Use the same project as the backend service account.
      - generic [ref=e7]:
        - generic [ref=e8]:
          - text: Email
          - textbox "Email" [ref=e9]
        - generic [ref=e10]:
          - text: Password
          - textbox "Password" [ref=e11]
        - button "Sign in" [ref=e12] [cursor=pointer]
    - generic [ref=e13]:
      - heading "Scenario Selection" [level=2] [ref=e14]
      - button "Start Scenario 1" [disabled] [ref=e15]
      - paragraph [ref=e16]: Sign in with Firebase to start a mission.
    - paragraph [ref=e18]: Click Start Scenario 1 to begin. You will get branching choices or a text box depending on the step — the server sends each scene.
  - alert [ref=e19]
```