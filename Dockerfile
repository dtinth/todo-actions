FROM node:12.6.0

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

RUN mkdir -p /app
ADD entrypoint.sh package.json yarn.lock /app
RUN cd /app && yarn --frozen-lockfile --production
ADD src /app/src
ENTRYPOINT ["/app/entrypoint.sh"]
