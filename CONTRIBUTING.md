# Contributing to SMM Panel

Thank you for your interest in contributing to the SMM Panel project! We welcome contributions from everyone.

## How to Contribute

### 1. Fork the Repository
- Click the "Fork" button on GitHub
- Clone your fork: `git clone https://github.com/yourusername/smm-panel.git`

### 2. Create a Feature Branch
```bash
git checkout -b feature/your-feature-name
```

### 3. Make Your Changes
- Follow the existing code style
- Add tests for new features
- Update documentation as needed

### 4. Commit Your Changes
```bash
git add .
git commit -m "Add: Brief description of your changes"
```

### 5. Push and Create Pull Request
```bash
git push origin feature/your-feature-name
```
Then create a Pull Request on GitHub.

## Development Setup

### Prerequisites
- Node.js 18+
- MongoDB 5.0+
- Git

### Installation
```bash
# Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your settings
npm start

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

## Code Style Guidelines

### JavaScript/Node.js
- Use ES6+ syntax
- Use `const` and `let` instead of `var`
- Use arrow functions when appropriate
- Add JSDoc comments for functions
- Use meaningful variable names

### React/Frontend
- Use functional components with hooks
- Follow component naming conventions
- Use Tailwind CSS classes consistently
- Keep components small and focused

### API Design
- Use RESTful conventions
- Return consistent JSON responses
- Use proper HTTP status codes
- Validate input data

## Testing
- Test your changes locally
- Ensure existing functionality still works
- Add unit tests for new features

## Reporting Issues
- Use GitHub Issues to report bugs
- Include steps to reproduce
- Add screenshots if applicable
- Specify your environment (OS, Node version, etc.)

## Feature Requests
- Open a GitHub Issue with "Feature Request" label
- Describe the feature and its benefits
- Discuss implementation approach if possible

## License
By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing! 🎉