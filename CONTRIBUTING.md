# Contributing to AlmostNo.js

Thank you for considering contributing to AlmostNo.js! We welcome all contributions that help improve the framework. This guide will help you get started with setting up, coding, and submitting changes.

---

## 1. Getting Started

### 1.1 Fork the Repository
First, fork the repository to your own GitHub account and clone it to your local machine.

```sh
# Clone your fork
git clone https://github.com/YOUR_USERNAME/almostno.js.git
cd almostno.js
```

### 1.2 Install Dependencies
We use `npm` for package management.

```sh
npm install
```

---

## 2. Development Guidelines

### 2.1 Code Style
Every single line of code in this repository must be commented. This is not optional.
 - It ensures **every part of the code is instantly understandable**, especially when switching between projects. Comments help recall the original thought process and allow developers to quickly skip over irrelevant lines visually.
 - It maintains **clarity over time**, even for logic that may seem obvious today but might be unclear later if not working on the project for a while.
 - It **eliminates ambiguity**—no guessing what a line does or why it exists.

Think it’s stupid? This **project doesn’t care**. It’s a requirement.

### 2.2 File Structure
Keep files **small and modular**. The directory structure is as follows:

```plaintext
/src
 ├── core.js       # Core framework logic
 ├── dom.js        # DOM manipulation utilities
 ├── state.js      # State management
 ├── events.js     # Event handling system
 ├── http.js       # AJAX & Fetch utilities
 ├── components.js # Component system
 ├── index.js      # Main entry point
/tests
 ├── state.test.js # Unit tests for state management
 ├── dom.test.js   # Unit tests for DOM utilities
/docs
 ├── CODESTYLE.md  # Code style guide
 ├── CONTRIBUTING.md
 ├── README.md
```

---

## 3. Testing

### 3.1 Running Tests
AlmostNo.js uses **Jest** for testing. Before submitting a pull request, ensure all tests pass:

```sh
npm run test
```

### 3.2 Writing Tests
- **Ensure full branch coverage**.
- **Test expected outputs and edge cases**.
- **Mock dependencies only when necessary**.

```js
// ✅ Correct: Explicitly test behavior
 test("should increment counter", () => {
    const state = $.state({ count: 0 });
    state.count++;
    expect(state.count).toBe(1);
 });

// ❌ Incorrect: Vague test without clear assertions
test("counter works", () => {
    expect(counter.click()).toBeTruthy();
});
```

---

## 4. Submitting Changes

### 4.1 Creating a Feature Branch
All changes should be made in a **feature branch**, not `main`.

```sh
git checkout -b feature/my-feature
```

### 4.2 Commit Messages
Follow this format:

```
feat: Add new event listener system
fix: Resolve issue with reactivity updates
refactor: Simplify state binding logic
test: Add missing Jest coverage
```

### 4.3 Push & Open a Pull Request
Once your changes are complete:

```sh
git add .
git commit -m "feat: Add new component system"
git push origin feature/my-feature
```

Then, go to GitHub and open a **Pull Request (PR)**.

---

## 5. Pull Request (PR) Guidelines

- **Ensure all tests pass (`npm run test`)**.
- **Follow the coding style (`npm run lint`)**.
- **Explain your changes in the PR description**.
- **Keep PRs focused on one logical change**.
- **Do not include unrelated files or changes**.

---

## 6. Reviewing & Merging

### 6.1 Code Review Process
- A maintainer will review your PR and request changes if needed.
- Once approved, your PR will be merged into `main`.
- You may be asked to **squash commits** before merging.

### 6.2 Merge Strategy
We use **squash and merge** to keep a clean commit history.

---

## 7. Issues & Bug Reports

If you encounter an issue, please **check open issues first**.

If no existing issue matches your problem:

1. **Open a new issue**.
2. **Describe the problem** clearly.
3. **Provide steps to reproduce**.
4. **Include expected vs. actual behavior**.
5. **Attach logs or screenshots if needed**.

---

## 8. Community & Support

- **Issues** – For reporting bugs.
- **Pull Requests** – For contributing code.

---

Thank you for contributing to AlmostNo.js! 🚀

