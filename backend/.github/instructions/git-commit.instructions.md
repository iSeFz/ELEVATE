# ✅ GitHub Copilot Instructions: Commit & Push Standards

These instructions apply to **any commit or push actions** performed by GitHub Copilot in this repository.

Copilot must follow these professional standards when generating **commit messages**, preparing **push descriptions**, or assisting in any **version control operations**.

---

## 🧠 General Behavior

Copilot should:

- Treat every commit as part of a **professional production-level codebase**
- Follow **semantic and meaningful commit messaging**
- Group related changes in a single commit when possible
- Never commit or push temporary files, secrets, or sensitive data
- Use proper spelling, grammar, and clarity in all messages
- Always keep commits **clear, concise, and informative**

---

## 📘 Commit Message Format

Each commit message must follow this format:

```text
<type>(<scope>): <short summary>

<optional detailed description>
<optional breaking change notice>
<optional issue or PR reference>
```

## Valid Commit Types (verbs):
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code formatting only (no logic change)
- `refactor`: Code change that improves structure without changing behavior
- `test`: Adding or improving tests
- `chore`: Build or maintenance changes (CI, tooling, config)
- `perf`: A performance improvement
- `ci`: Continuous integration changes

## 🔍 Description Guidelines
When adding a description under the summary:
- Explain what changed and why
- Mention relevant context: what bug it fixes, what user story it addresses, or what feature it implements
- If applicable, describe how to test the change or what it affects
- Always refer to related issue/PR numbers using #123 notation
