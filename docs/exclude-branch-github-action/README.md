---
title: Exclude branch in GitHub action
lang: en-US
shareTags:
    - github
    - ci
    - githubaction
---

<social-share />

# Exclude branch in GitHub action

Recently I've faced a painpoint trying to exclude a branch from certain CI job using GitHub actions. 

### Example

Our example will cover two main use cases:

- Make a deployment only if the branch is the `master` branch.
- Run build and unit tests only if the branch is not the `master` branch.

#### Make a deployment only for certain branch

Here is the YML content:

```yml
name: Deploy

on:
  push:
    branches: 
      - 'master'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - run: yarn deploy
```

Main part is about the branch filter:

```yml
on:
  push:
    branches: 
      - 'master'
```

The `branches` filter allows to filter by branch names and branch patterns, the above example will run the job `deploy` only if the branch where we just pushed a commit is the `master` branch.

#### Build and test only for certain branches

Here is the YML content:

```yml
name: Push CI

on:
  push:
    branches-ignore:
      - 'master'
      - 'gh-pages'

jobs:
  build:

    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2
    - uses: actions/setup-node@v1
    - run: yarn install
    - run: yarn build
    - run: yarn test:unit
```

Now, let's the `branches-ignore` filter.

```yml
on:
  push:
    branches-ignore:
      - 'master'
      - 'gh-pages'
```

Using the above filter we can run our job against any branch except `master` and `gh-pages` branches.

<Disqus/>