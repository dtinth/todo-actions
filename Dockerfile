FROM node:12.6.0-slim

LABEL "com.github.actions.name"="TODO"
LABEL "com.github.actions.description"="Convert TODO comments to issues"
LABEL "com.github.actions.icon"="alert-circle"
LABEL "com.github.actions.color"="gray-dark"

LABEL "repository"="http://github.com/dtinth/todo-actions"
LABEL "homepage"="http://github.com/dtinth/todo-actions"
LABEL "maintainer"="dtinth <dtinth@spacet.me>"

ENV GIT_COMMITTER_NAME=TODO
ENV GIT_AUTHOR_NAME=TODO
ENV EMAIL=todo-collector[bot]@users.noreply.github.com

ADD entrypoint.sh /entrypoint.sh
ADD src /usr/app/src
ENTRYPOINT ["/entrypoint.sh"]
