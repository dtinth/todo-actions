workflow "Process TODO comments" {
  on = "push"
  resolves = ["Collect TODO"]
}

action "Collect TODO" {
  uses = "./"
  secrets = ["GITHUB_TOKEN"]
}
