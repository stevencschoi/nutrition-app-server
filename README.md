# Project Title

One Paragraph of project description goes here

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

git clone

### Prerequisites

This project operates on the following dependencies:

- Postgres [install postgres](https://www.postgresql.org/)
- Nodejs [install node.js](https://nodejs.org/en/)

```
Give examples
```

### Installing

A step by step series of examples that tell you how to get a development env running

Initialize database

```
CREATE ROLE vegtable WITH LOGIN password 'password'
CREATE DATABASE vegtable_development OWNER vegtable
```

run migrations (schema)
run seeds (default users, favorites, default data, etc.)

```
psql \i ...
```

install packages

```
npm install
```

## Usage

End with an example of getting some data out of the system or using it for a little demo
How to run the app

```
npm run start
```

## Running the tests

Explain how to run the automated tests for this system

## Development

Please read [CONTRIBUTING.md](https://gist.github.com/PurpleBooth/b24679402957c63ec426) for details on our code of conduct, and the process for submitting pull requests to us.

fork repo
work in feature branch
push up and make pull request

## Deployment

Add additional notes about how to deploy this on a live system

```
git push heroku master
```

## Built With

- [Dropwizard](http://www.dropwizard.io/1.0.2/docs/) - The web framework used
- [Maven](https://maven.apache.org/) - Dependency Management
- [ROME](https://rometools.github.io/rome/) - Used to generate RSS Feeds

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags).

## Authors

- **Billie Thompson** - _Initial work_ - [PurpleBooth](https://github.com/PurpleBooth)

See also the list of [contributors](https://github.com/your/project/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

- Hat tip to anyone whose code was used
- Inspiration
- etc
