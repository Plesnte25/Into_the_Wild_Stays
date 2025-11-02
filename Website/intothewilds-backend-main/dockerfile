# Step 1: Set the base image (Node.js image)
FROM node:18

# Step 2: Set the working directory inside the container
WORKDIR /usr/src/app

# Step 3: Copy the package.json and package-lock.json files
COPY package*.json ./

# Step 4: Install the dependencies
RUN npm install

# Step 5: Copy the rest of the application files
COPY . .

# Step 6: Expose the port the app will run on (adjust if your app runs on another port)
EXPOSE 3000

# Step 7: Run the app
CMD ["npm", "start"]
