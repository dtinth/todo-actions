# todo-actions
Turn TODO in source code into issues and close them when they are gone. Runs on GitHub Actions. This project is hugely inspired by [0pdd](https://www.yegor256.com/2017/04/05/pdd-in-action.html).

## Glossary

- **TODO comment:** A TODO comment inside the source code.
  It begins with a _TODO marker_, and followed by a block of text whose first line is the title and the rest is the body.

- **TODO marker:** The text that denotes a TODO comment.
  It begins with the word `TODO`, may contain a _reference_ inside square brackets, and ends with a colon.
  In order for the marker to be recognized, it must follow a whitespace, and no alphanumeric character may precede it.

  Examples:
  - `TODO:` — a new, unidentified to-do item.
  - `TODO [$5d20dc8e6a26d44c2afd08c6]:` — an identified to-do item, but not yet associated with a task.
  - `TODO [#1]:` — a to-do item that has been associated with a task.

- **Repository:** A GitHub repository. Don't use the word “project” when you mean “repository.”

- **Task:** A work item that is automatically opened and closed by `todo-actions`.
  This may be a GitHub “Issue”, a “Card” inside GitHub Projects or Trello, a “Task” inside Taskworld, or a “Ticket.”

  - **To complete a task** may means “to close an issue,” “to move a card to done,” or “to mark as completed/resolved,” depending on the task management system you use.

## Implementation overview

1. A `push` event causes the action to run in GitHub Actions. If the current branch is master, it continues. Otherwise, it is aborted.

2. The action scans for `TODO` comments.

   ```
   // TODO: implement this thing
   ```

3. Each new TODO marker is then replaced with a unique ID.

   ```
   // TODO [$5d20dc8e6a26d44c2afd08c6]: implement this thing
   ```

4. The change is committed and pushed to the repository. If the push is successful, then we have successfully uniquely identified each to-do comment. Otherwise, someone else has made another commit to the repository, and the action is aborted.

5. For each `TODO` marker, create a GitHub issue. Then replace the marker with the issue number.

   ```
   // TODO [#1]: implement this thing
   ```

6. The change is committed and pushed to the repository. If the push is successful, then it is done. Otherwise, someone else has made another commit to the repository, the action on that commit will take care of committing.

## Parsing TODO comments

1. A TODO marker looks like this:

    - `TODO:` — new, unidentified to-do item
    - `TODO [$5d20dc8e6a26d44c2afd08c6]` — identified to-do item, but an issue has not been created
    - `TODO [#1]` — a to-do item with an associated issue

2. A TODO marker must be preceded by a white space.
   Before that whitespace, there should be no alphanumeric characters.
   Everything before the TODO marker is called a prefix.

3. The TODO contents follows the marker, as long as subsequent lines start with the same prefix as the first.

Example:

```
// TODO: Subject
// Body here
```
