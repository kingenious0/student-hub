# Contributing to LaHustle

Thank you for your interest in contributing to the Student Hub project! Since this is a private repository, please adhere to the following guidelines to maintain code quality and security.

## 🔒 Security & Privacy

- **Do not commit secrets.** Ensure `.env` files and other secrets are never pushed to the repository.
- **Respect user data.** Follow all data privacy protocols when handling test data.

##  workflow

1.  **Issue Tracking:** Ensure there is an issue or task card created for the feature or bug you are working on.
2.  **Branching:**
    - Create a new branch for each feature or fix.
    - Use descriptive branch names: `feature/name-of-feature`, `fix/issue-description`, `chore/maintenance-task`.
    - Example: `feature/add-vendor-dashboard`, `fix/login-error`.
3.  **Development:**
    - Follow the existing code style and conventions.
    - Write clean, maintainable code.
    - Ensure your changes do not break existing functionality.
4.  **Commits:**
    - Write clear and concise commit messages.
    - Use the imperative mood (e.g., "Add feature" not "Added feature").
    - Reference issue numbers if applicable.

## 🧪 Testing

- Run the development server and manually verify your changes.
- If applicable, add unit or integration tests.
- Ensure the build passes before submitting a Pull Request (`npm run build`).

## 📝 Pull Request Process

1.  Push your branch to the repository.
2.  Open a Pull Request (PR) against the `main` (or `develop`) branch.
3.  Provide a clear description of the changes and the problem they solve.
4.  Attach screenshots or videos for UI changes.
5.  Request a code review from a team member.
6.  Address any feedback and merge once approved.

## 🎨 Coding Standards

- **React/Next.js:** Use functional components and Hooks.
- **Styling:** Use Tailwind CSS utility classes. Avoid inline styles where possible.
- **Types:** Use TypeScript interfaces and types for better type safety.
- **File Naming:** Use `PascalCase` for components and `kebab-case` for utilities/helpers.

Thank you for helping make Student Hub better!
