# Use the official Node.js 20 image as a parent image
FROM oven/bun:latest

# Set the working directory in the container
WORKDIR /app

# Copy package.json and bun.lockb (if you have one)
COPY package.json bun.lockb* ./

# Install dependencies
RUN bun install

# Copy the rest of your application's code
COPY . .

# Expose the port your app runs on
EXPOSE 4000

# Define the command to run your app
CMD ["bun", "run", "start"]