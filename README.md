# Shadow Ballot
# Voting System Application

Welcome to Shadow Ballot, a secure and user-friendly platform designed to facilitate online voting for university societies and elections. This application allows users to create societies, manage memberships, conduct elections, and cast votes with ease, all while ensuring the highest standards of security and privacy.

## Built With
- `TypeScript`: Primary language used for the project.
- `vite`: Frontend build tool.
- `React`: The web framework used for the frontend.
- `Node.js`: Server environment.
- `Express.js`: Web application framework for Node.js.
- `Sequelize`: Promise-based Node.js ORM for SQLite and PostgreSQL.
- `PostgreSQL & SQLite`: Used for production and development databases, respectively.

## Features
- **User Authentication**: Secure login and registration system to manage user access.
- **Society Management**: Users can create, join, and manage societies.
- **Election Creation**: Society owners can create elections, set start and end times, and define k-anonymity values for voter privacy.
- **Candidate Management**: Add and manage candidates for each election.
- **Voting**: Secure and anonymous voting mechanism for society members.
- **Real-Time Results**: View election results in real-time, with privacy-preserving measures in place.

## Project structure
An overview of directories is as follows:
- `client/`: Client-side/front-end code
  - `routes/`: Routes are standalone pages of the app
  - `components/`: Reusable react components that are used throughout the app
  - `config.ts`: Front-end configuration tokens
- `server/`: Back-end code
  - `configs/`: Collection of back-end configuration tokens (eg `db.config.ts`)
  - `middleware/`: Project-specific NodeJS middleware
  - `routes/`: Collection of API routes
  - `services/`: DB-level access services consumed by routes and middleware

## Getting Started
These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.
### Installation
1. Clone the repository:
```bash
git clone https://git.cs.bham.ac.uk/projects-2023-24/aib924.git
```

## Development

Before you can run this project, you must move into the development directory using:
```shell
cd localVersion/
```

Install its dependencies on your machine using:
```shell
npm install
```

To start the app in development mode, run
```shell
npm run dev
```
The application should now be running on http://localhost:5173 and the server on http://localhost:8000.

## Building for production

Before you can build this project, you must move into the development directory using:
```shell
cd deployedVersion/
```

Install its dependencies on your machine using:
For entire project:
```shell
npm run install-all
```
For installing packages on client only:

```shell
cd client/
```

```shell
npm run install-client
```

For installing packages on server only:

```shell
cd server/
```

```shell
npm run install-server
```


This project can be packaged for production using (from the deployedVersion directory):

```shell
npm run build
```



