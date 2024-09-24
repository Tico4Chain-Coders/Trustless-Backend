# Commit Guidelines | TRUSTLESS WORK

This guideline aims to establish a clear set of conventions for commit messages in this project. Following these conventions helps maintain a clear and consistent commit history.

## Commit Message Structure

A commit message should follow the format:




### Types of Commits

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Changes that do not affect the meaning of the code (formatting, etc.)
- `refactor`: Code changes that neither fix a bug nor add a feature
- `perf`: Changes that improve performance
- `test`: Adding missing tests or correcting existing tests
- `build`: Changes that affect the build system or external dependencies
- `ci`: Changes to CI configuration files and scripts
- `chore`: Maintenance changes that do not fall into any of the other categories

### Scope

The scope is optional and can be the name of the module or component affected by the change. For example:


### Message

The message should be clear and descriptive, including the "what" and "why" of the change. It should be concise (less than 72 characters).

### Example Commit Messages

- `feat: add user registration support`
- `fix: fix price validation error`
- `docs: update installation section`

## Additional Notes

- Use the present tense in commit messages (e.g., "add" instead of "added").
- Keep the message brief and direct.
- If necessary, add an additional message body for more context. Separate the body from the header with a blank line.

### Example Commit with Body

