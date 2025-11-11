# Contributing to CareerMentor

Thank you for your interest in contributing to CareerMentor! This document provides guidelines and information for contributors.

## Code of Conduct

Be respectful, professional, and constructive in all interactions.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/yourusername/CareerMentor/issues)
2. If not, create a new issue with:
   - Clear description of the problem
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, Docker version, etc.)
   - Relevant logs or screenshots

### Suggesting Features

1. Check [Issues](https://github.com/yourusername/CareerMentor/issues) for existing feature requests
2. Create a new issue with:
   - Clear use case description
   - Proposed solution
   - Alternative approaches considered
   - Impact on existing functionality

### Submitting Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes following our coding standards
4. Test your changes thoroughly
5. Commit with clear, descriptive messages
6. Push to your fork
7. Submit a pull request

## Development Setup

### Prerequisites

- Docker Desktop or Docker + Docker Compose
- Python 3.11+ (for local development)
- Node.js 18+ (for frontend development)
- Git

### Local Development

1. Clone your fork:
```bash
git clone https://github.com/yourusername/CareerMentor.git
cd CareerMentor
```

2. Copy environment template:
```bash
cp .env.example .env
```

3. Start services:
```bash
docker-compose -f docker-compose.simple.yml --profile cpu up -d
```

4. For local development without Docker:
```bash
# API Service
cd services/api
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

## Coding Standards

### Python (Backend Services)

- Follow PEP 8 style guide
- Use type hints for function signatures
- Write docstrings for public functions and classes
- Keep functions focused and under 50 lines when possible
- Use async/await for I/O operations

Example:
```python
async def process_document(
    document_id: str,
    user_id: str,
    options: Dict[str, Any]
) -> ProcessingResult:
    """
    Process a document for RAG indexing.

    Args:
        document_id: Unique document identifier
        user_id: User who owns the document
        options: Processing configuration options

    Returns:
        ProcessingResult with status and metadata
    """
    # Implementation
```

### TypeScript/JavaScript (Frontend)

- Use TypeScript for all new code
- Follow React best practices
- Use functional components with hooks
- Keep components small and reusable
- Use meaningful variable names

Example:
```typescript
interface ChatMessageProps {
  message: Message;
  isUser: boolean;
  citations?: Citation[];
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isUser,
  citations
}) => {
  // Implementation
};
```

### Docker and Infrastructure

- Use multi-stage builds for smaller images
- Pin specific versions in Dockerfiles
- Include health checks for all services
- Document environment variables

## Testing

### Running Tests

```bash
# API tests
cd services/api
pytest

# Frontend tests
cd frontend
npm test

# Integration tests
cd tests
pytest integration/

# E2E tests
pytest e2e/
```

### Writing Tests

- Write unit tests for new functions
- Include integration tests for API endpoints
- Add E2E tests for critical user flows
- Aim for >80% code coverage

## Documentation

- Update README.md for user-facing changes
- Add docstrings to all public Python functions
- Include JSDoc comments for TypeScript functions
- Update API documentation in OpenAPI spec
- Add examples for new features

## Commit Messages

Follow conventional commits format:

```
type(scope): subject

body (optional)

footer (optional)
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(api): add document upload endpoint

fix(frontend): resolve chat message rendering issue

docs(readme): update installation instructions
```

## Project Architecture

### Service Boundaries

- **API Service**: Authentication, chat orchestration, user management
- **Knowledge Service**: Document processing, embeddings, search
- **Worker Service**: Background jobs, async tasks
- **Frontend**: UI, client-side state management

### Key Technologies

- **FastAPI**: Async web framework for Python services
- **LangChain**: LLM application framework
- **Ollama**: Local LLM inference
- **pgvector**: Vector similarity search
- **Next.js**: React framework with SSR
- **Redis**: Caching and message queue
- **PostgreSQL**: Primary database

### Adding New Features

1. Determine which service owns the feature
2. Design API contracts between services
3. Implement backend logic with tests
4. Add frontend UI components
5. Update documentation
6. Test end-to-end functionality

## Performance Considerations

- Use async/await for I/O operations
- Implement caching where appropriate
- Optimize database queries
- Minimize LLM calls
- Use background workers for heavy processing

## Security Guidelines

- Never commit secrets or credentials
- Validate all user inputs
- Use parameterized database queries
- Implement rate limiting for APIs
- Follow OWASP security best practices

## Getting Help

- Create an issue for questions
- Join discussions in GitHub Discussions
- Review existing documentation

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
