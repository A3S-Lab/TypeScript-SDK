# A3S TypeScript SDK

# Install dependencies
install:
    npm install

# Build TypeScript
build:
    npm run build

# Clean build artifacts
clean:
    npm run clean

# Type check without emitting
check:
    npx tsc --noEmit

# Run tests
test:
    npm test

# Run tests in watch mode
test-watch:
    npm run test:watch

# Format code (if prettier is added)
fmt:
    @echo "No formatter configured"

# Lint code (if eslint is added)
lint:
    @echo "No linter configured"

# Build and test
all: build test
