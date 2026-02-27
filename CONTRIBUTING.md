# Contributing to Karan's iPod

Thank you for contributing to Karan's iPod! This document provides guidelines for contributing to the project.

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- Git

### Setup

```bash
# Fork and clone the repository
git clone https://github.com/your-username/Karan-s-Ipod.git
cd Karan-s-Ipod

# Install dependencies
npm install
pip install -r requirements.txt

# Set up environment
cp .env.example .env.local
```

## Development Workflow

1. **Create a branch** for your feature or fix:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-number-description
   ```

2. **Make your changes** following the code style guidelines below.

3. **Test your changes**:
   ```bash
   # Run frontend linting
   npm run lint

   # Run backend tests (if applicable)
   python -m pytest tests/backend/

   # Run E2E tests
   npm run test
   ```

4. **Commit your changes** using conventional commit messages.

5. **Push and open a pull request**.

## Code Style

### TypeScript/React

- **Components**: PascalCase (`MenuScreen.tsx`, `NowPlayingScreen.tsx`)
- **Hooks**: `use` prefix + PascalCase (`useMusicPlayer.ts`, `useNavigation.ts`)
- **Utils**: camelCase (`musicApi.ts`)
- **Types/Interfaces**: PascalCase with descriptive names

**ESLint + Prettier** are configured and enforced. Run before committing:

```bash
npm run lint
npx prettier --write src/
```

### Python

- Follow **PEP 8** style guidelines
- Use **snake_case** for file names and functions
- Use **PascalCase** for classes

**Recommended tools** (optional):
```bash
pip install black flake8
black scripts/
flake8 scripts/
```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add shuffle mode for music player
fix: resolve playlist deletion bug
docs: update README with new project structure
refactor: reorganize scripts into subfolders
style: format code with prettier
test: add E2E tests for search functionality
chore: update dependencies
```

## Folder Structure

```
├── src/           # Frontend React source code
├── components/    # React UI components
├── hooks/         # Custom React hooks
├── api/           # Flask backend API
├── scripts/       # Python utility scripts
│   ├── data/      # Data fetching & seeding
│   ├── maintenance/ # Library maintenance
│   └── utils/     # Utility scripts
├── tests/         # Test files
│   ├── e2e/       # Playwright E2E tests
│   └── backend/   # Python backend tests
└── public/        # Static assets
```

## Folder Ownership

| Folder | Responsibility |
|--------|---------------|
| `src/` | Frontend components, pages, logic |
| `components/` | Reusable UI components |
| `hooks/` | Custom React hooks |
| `api/` | Backend API routes |
| `scripts/` | Data, maintenance, and utility scripts |
| `tests/` | All test files |
| `public/` | Static assets served directly |

## Pull Request Guidelines

### Before Submitting

- [ ] Code follows style guidelines (ESLint + Prettier)
- [ ] Self-review completed
- [ ] Tests pass (if applicable)
- [ ] Documentation updated (if needed)
- [ ] No console.log or debug statements left in code

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe testing done

## Screenshots (if applicable)
Add screenshots for UI changes
```

## Reporting Issues

### Bug Reports

Include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment (OS, browser, Node version)
- Screenshots if applicable

### Feature Requests

Include:
- Problem the feature solves
- Proposed solution
- Alternatives considered
- Use cases

## Questions?

Open an issue with the `question` label or reach out to the maintainer.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
