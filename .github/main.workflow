workflow "New workflow" {
  on = "push"
  resolves = ["./"]
}

action "./" {
  uses = "./"
  secrets = ["GITHUB_TOKEN"]
}
