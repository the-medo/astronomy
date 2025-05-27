# Dynamic Parallax Calculator

This project is a web-based calculator for computing dynamic parallax in binary star systems. It allows users to input parameters such as relative magnitudes, semi-axis values, and observation length to calculate various astronomical values including excentricity, ellipsis area, period, and star weights.

## Features

- Interactive form with sliders for parameter input
- Real-time computation of intermediate values
- Detailed iteration results displayed in a table
- Final results summary
- URL parameter support for sharing calculations
- Responsive design for various screen sizes

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (version 14.x or higher)
- npm (comes with Node.js) or [Yarn](https://yarnpkg.com/) or [Bun](https://bun.sh/)

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/the-medo/astronomy.git
   cd astronomy/dynamic-parallax
   ```

2. Install dependencies:
   `npm install` / `yarn install` / `bun install`

## Running the Application

To start the development server:
`npm start` / `yarn start` / `bun start`

The application will open in your default web browser at [http://localhost:3000](http://localhost:3000).

## Project Structure

- `src/` - Source code
  - `components/` - React components
  - `lib/` - Utility functions and calculations
  - `types/` - TypeScript type definitions
- `public/` - Static assets

## Technologies Used

- React
- TypeScript
- Ant Design
- CSS
