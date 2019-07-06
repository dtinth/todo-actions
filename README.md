# todo-actions
Turn TODO in source code into issues and close them when they are gone. Runs on GitHub Actions. This project is hugely inspired by [0pdd](https://www.yegor256.com/2017/04/05/pdd-in-action.html).

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
