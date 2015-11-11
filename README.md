# gcci-cell-survey

## Development Prerequisite
- node.js and npm (npm is included in node.js)
- gulp

## Development
1. clone repository
2. navigate into directory
3. run `npm install` to install node.js modules
4. compile static files
  - run `gulp compile` to manually compile files
  - run `gulp watch` to watch any file change and compile automatically

## Local Server
1. run `node server` to start local server
2. launch browser and access the site `http://localhost:8080`

## Deployment
1. run `firebase deploy`
2. Launch browser and access the site `https://gcci-cell-survey.firebaseapp.com`

## Terminology
- Survey Form - a form for user to fill out
- Survey Answers - data that represents selected items on the survey form
- Survey - includes form, answers and other data, such as date, uid