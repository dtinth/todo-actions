FROM node:12.6.0-slim

LABEL "com.github.actions.name"="TODO"
LABEL "com.github.actions.description"="Convert TODO comments to issues"
LABEL "com.github.actions.icon"="mic"
LABEL "com.github.actions.color"="alert-circle"

LABEL "repository"="http://github.com/dtinth/todo-actions"
LABEL "homepage"="http://github.com/dtinth/todo-actions"
LABEL "maintainer"="dtinth <dtinth@spacet.me>"

# ADD entrypoint.sh /entrypoint.sh
# ENTRYPOINT ["/entrypoint.sh"]
