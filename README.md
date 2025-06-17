# DSO101: Continuous Integration and Continuous Deployment - Final Project
## Project Overview
This project implements a DevSecOps pipeline for a PERN stack (PostgreSQL, Express, React, Node.js) application using free-tier tools:

- **Jenkins** (for automated GitHub pushes)

- **GitHub Actions** (for Docker builds & pushes)

- **Docker Hub** (for container storage)

- **Render** (for deployment)

The goal is to **automate code synchronization, deployment, and security checks** while adhering to **zero-cost constraints.**

## Repository Setup

1. **Create a GitHub Repository**: Initialized a new repository for assignment. [DSO-FinalAssignment](https://github.com/C-gyeltshen/DSO-FinalAssignment.git)
2. **Clone the Repository**: Cloned the repository to your local machine.

   ```bash
   git clone https://github.com/adefrutoscasado/pern-dockerized-stack.git
   ```
   ![1](./image/1.png)
3. Remove the existing `.git` directory to start fresh:

   ```bash
   rm -rf .git
   ```
   ![2](./image/2.png)

4. **Initialize a New Git Repository**: Initialize a new Git repository in the cloned directory.
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/C-gyeltshen/DSO-FinalAssignment.git
    git branch -M main
    git push -u origin main
   ```
    ![3](./image/3.png)

## Project Structure
The project is structured as follows:

```
├── backend/
├── docker/
├── frontend/
├── image/
├── LICENSE.md
└── README.md
```

## BMI Setup Instructions

### 1. **backend/**: Contains the Node.js and Express backend code.

   ```bash 
   cd backend
   npm install
   ```
   * Create a `postgres database` in `render.com`.

      ![4](./image/4.png)

   * Create a `.env` file in the `backend` directory with the following content:

      ```bash
      DATABASE_HOST="your database host"
      DATABASE_PORT="port your db is rinning on"
      DATABASE_USER="your database username"
      DATABASE_PASSWORD="database password"
      DATABASE_NAME="your database name"
      ```

   * Run the backend server:

      ```bash
      npm start
      ```
      ![5](./image/5.png)


### 2. **frontend/**: Contains the React frontend code.

   ```bash
   cd frontend
   npm install
   ```
   ```bash
   npm start
   ```
   ![6](./image/6.png)

   * Edit the `src/app.js` file and add code for the BMI calculator:

      ![10](./image/10.png)

### 3. **Database Setup**

   * Create `bmi_recordes` table in the database using the following SQL command:

      ```sql
      CREATE TABLE bmi_records (
         id SERIAL PRIMARY KEY,
         height NUMERIC(5,2) NOT NULL,
         weight NUMERIC(5,2) NOT NULL,
         age INTEGER NOT NULL,
         bmi NUMERIC(5,2) NOT NULL,
         created_at TIMESTAMPTZ DEFAULT NOW()
      );
      ```
      ![7](./image/7.png)
      ![8](./image/8.png)
      ![9](./image/9.png)

### 3. Add new endpoint in `backend/routes/bmi.js`:

   * Insert dummy data in `bmi_records` table using the following SQL command:

      ```sql
      INSERT INTO bmi_records (height, weight, age, bmi)
      VALUES 
      (1.60, 50, 22, 19.53),
      (1.75, 70, 25, 22.86),
      (1.68, 80, 30, 28.32),
      (1.82, 90, 35, 27.17),
      (1.55, 45, 20, 18.73),
      (1.90, 100, 40, 27.7),
      (1.72, 65, 28, 21.97),
      (1.78, 85, 32, 26.8),
      (1.60, 60, 26, 23.44),
      (1.70, 95, 38, 32.87);
      ```
      ![11](./image/11.png)

   * Check the database to ensure the data is inserted correctly:

      ![12](./image/12.png)

   * Create `endpoint` to get all BMI records:

      ```bash
         touch backend/routes/bmi.js
      ```

      ```javascript
         import { Router, Request, Response } from 'express'
         import { errorHandler } from '../utils'
         import knex from 'knex'
         import { databaseConfig } from '../config'

         const router = Router()
         const db = knex(databaseConfig)

         // GET /api/user/bmi - fetch all BMI records
         router.get('/user/bmi', errorHandler(async (req: Request, res: Response) => {
         const records = await db('bmi_records').select('*').orderBy(' created_at ', 'desc')
         res.json(records)
         }))

         export default router
      ```

   * `Test` the endpoint using `Postman`:
   
      ![13](./image/13.png)

   * Create new `endpoint` for add BMI records under `backend/routes/bmi.js`:

      ```javascript
         router.post('/create/bmi', errorHandler(async (req: Request, res: Response) => {
         const { id, height, weight,age, bmi } = req.body;

         if (!id || !height || !weight || !age || !bmi) {
            return res.status(400).json({ message: 'Missing required fields' });
         }

         const [record] = await db('bmi_records')
            .insert({ id, height, weight, bmi })
            .returning('*');

         res.status(201).json(record);
         }));
      ```

   * Test the new endpoint using `Postman`:

      ![14](./image/14.png)

## Writing Tests

* Install the required dev dependencies for testing:

   ```bash
   npm install --save-dev jest supertest @types/jest @types/supertest
   ```

* Create test file `backend/tests/bmi.test.js`:

   ```javascript
         /// <reference types="jest" />
      import request from 'supertest'
      import app from '../src/app'

      describe('BMI API', () => {
      it('should create a new BMI record', async () => {
         const res = await request(app)
            .post('/api/create/bmi')
            .send({
            id: Math.floor(Math.random() * 1000000),
            height: 1.75,
            weight: 70,
            age: 25,
            bmi: 22.86
            })
            .set('Accept', 'application/json')

         expect(res.status).toBe(201)
         expect(res.body).toHaveProperty('id')
         expect(res.body.height).toBe(1.75)
         expect(res.body.weight).toBe(70)
         expect(res.body.age).toBe(25)
         expect(res.body.bmi).toBeCloseTo(22.86)
      })

      it('should fail with missing fields', async () => {
         const res = await request(app)
            .post('/api/create/bmi')
            .send({
            height: 1.75,
            weight: 70,
            age: 25
            // bmi missing
            })
            .set('Accept', 'application/json')

         expect(res.status).toBe(400)
         expect(res.body).toHaveProperty('message', 'Missing required fields')
      })
      })
   ```
   ![15](./image/15.png)

   * Create test file for frontend `frontend/src/App.test.js`:

   ```javascript
      import React from 'react'
      import { render, screen, fireEvent, waitFor } from '@testing-library/react'
      import BMICalculator from './App'
      import '@testing-library/jest-dom'

      beforeEach(() => {
      global.fetch = jest.fn((url, options) => {
         if (url === '/api/user/bmi' && (!options || options.method === 'GET')) {
            return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([
               {
                  id: '1',
                  height: 1.75,
                  weight: 70,
                  age: 25,
                  bmi: 22.86,
                  createdAt: new Date().toISOString()
               }
            ])
            })
         }
         if (url === '/api/create/bmi' && options && options.method === 'POST') {
            return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({})
            })
         }
         if (url && url.startsWith('/api/user/bmi/') && options && options.method === 'DELETE') {
            return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
         }
         return Promise.resolve({ ok: false, json: () => Promise.resolve({}) })
      }) as any
      window.confirm = jest.fn(() => true)
      })

      afterEach(() => {
      jest.clearAllMocks()
      })

      test('renders calculator tab and input fields', () => {
      render(<BMICalculator />)
      expect(screen.getByText(/BMI Calculator & Tracker/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Height/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Weight/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Age/i)).toBeInTheDocument()
      })

      test('calculates BMI and shows result (Calculate Only)', () => {
      render(<BMICalculator />)
      fireEvent.change(screen.getByPlaceholderText(/e.g., 1.75/i), { target: { value: '1.75' } })
      fireEvent.change(screen.getByPlaceholderText(/e.g., 70.5/i), { target: { value: '70' } })
      fireEvent.change(screen.getByPlaceholderText(/e.g., 25/i), { target: { value: '25' } })
      fireEvent.click(screen.getByText(/🧮 Calculate Only/i))
      expect(screen.getByText(/BMI calculated successfully/i)).toBeInTheDocument()
      expect(screen.getByText(/Your BMI Result/i)).toBeInTheDocument()
      expect(screen.getByText(/BMI: 22.86/i)).toBeInTheDocument()
      expect(screen.getByText(/Category: Normal weight/i)).toBeInTheDocument()
      })

      test('shows error for invalid input', () => {
      render(<BMICalculator />)
      fireEvent.change(screen.getByPlaceholderText(/e.g., 1.75/i), { target: { value: '' } })
      fireEvent.change(screen.getByPlaceholderText(/e.g., 70.5/i), { target: { value: '' } })
      fireEvent.click(screen.getByText(/🧮 Calculate Only/i))
      expect(screen.getByText(/Please enter valid height and weight/i)).toBeInTheDocument()
      })

      test('shows error for out-of-range input', () => {
      render(<BMICalculator />)
      fireEvent.change(screen.getByPlaceholderText(/e.g., 1.75/i), { target: { value: '0.2' } })
      fireEvent.change(screen.getByPlaceholderText(/e.g., 70.5/i), { target: { value: '5' } })
      fireEvent.click(screen.getByText(/🧮 Calculate Only/i))
      expect(screen.getByText(/Please enter a realistic height between 0.5m and 3m/i)).toBeInTheDocument()
      })

      test('saves BMI and clears form', async () => {
      render(<BMICalculator />)
      fireEvent.change(screen.getByPlaceholderText(/e.g., 1.75/i), { target: { value: '1.75' } })
      fireEvent.change(screen.getByPlaceholderText(/e.g., 70.5/i), { target: { value: '70' } })
      fireEvent.change(screen.getByPlaceholderText(/e.g., 25/i), { target: { value: '25' } })
      fireEvent.click(screen.getByText(/💾 Calculate & Save BMI/i))
      await waitFor(() => {
         expect(screen.getByText(/BMI calculated and saved successfully/i)).toBeInTheDocument()
      })
      expect(screen.getByPlaceholderText(/e.g., 1.75/i)).toHaveValue('')
      expect(screen.getByPlaceholderText(/e.g., 70.5/i)).toHaveValue('')
      expect(screen.getByPlaceholderText(/e.g., 25/i)).toHaveValue('')
      })

      test('switches to history tab and loads BMI history', async () => {
      render(<BMICalculator />)
      fireEvent.click(screen.getByText(/BMI History/i))
      await waitFor(() => {
         expect(screen.getByText(/Your BMI History/i)).toBeInTheDocument()
         expect(screen.getByText(/Total Records: 1/i)).toBeInTheDocument()
         expect(screen.getByText(/22.86/)).toBeInTheDocument()
         expect(screen.getByText(/Normal weight/)).toBeInTheDocument()
      })
      })

      test('deletes a BMI record', async () => {
      render(<BMICalculator />)
      fireEvent.click(screen.getByText(/BMI History/i))
      await waitFor(() => expect(screen.getByText(/🗑️ Delete/i)).toBeInTheDocument())
      fireEvent.click(screen.getByText(/🗑️ Delete/i))
      await waitFor(() => expect(screen.getByText(/BMI record deleted successfully/i)).toBeInTheDocument())
      })

      test('clear form button resets fields', () => {
      render(<BMICalculator />)
      fireEvent.change(screen.getByPlaceholderText(/e.g., 1.75/i), { target: { value: '1.75' } })
      fireEvent.change(screen.getByPlaceholderText(/e.g., 70.5/i), { target: { value: '70' } })
      fireEvent.change(screen.getByPlaceholderText(/e.g., 25/i), { target: { value: '25' } })
      fireEvent.click(screen.getByText(/🗑️ Clear Form/i))
      expect(screen.getByPlaceholderText(/e.g., 1.75/i)).toHaveValue('')
      expect(screen.getByPlaceholderText(/e.g., 70.5/i)).toHaveValue('')
      expect(screen.getByPlaceholderText(/e.g., 25/i)).toHaveValue('')
      })
   ```
   ![16](./image/16.png)

## Stage 1: Docker Configuration

### 1. Docker `volumes` to save the BMI data.

   I am using `Renders free-tier PostgreSQL database` which is fully managed, hosted separately from the `BMI` application container.

   It is connected using `connection strings`, not by mounting database files via Docker volumes.

   Docker volumes are only used when you run your own `database inside a container`, e.g., for local development.


### 2. `Writing` and `running tests` using the `docker-compose.yaml` file



## Stage 2: Jenkins Local Setup for GitHub Push Automation

### **Objective**: 
* Configure Jenkins to automatically push code to GitHub when a commit message contains @push.

### **Prerequisites**:

* **Jenkins** installed locally or on a server.

   ```bash 
      brew install jenkins-lts
   ```

   ```bash 
      brew services start jenkins-lts
   ```
   ![17](./image/17.png)

### **Steps**:

1. Create jekinsfile in the root directory of your project:

   ```bash
   touch jenkinsfile
   ```
2. Add the following content to the `Jenkinsfile`:

   ```groovy
      pipeline {
         agent any
         stages {
            stage('Build') {
               steps {
                  script {
                     if (env.GIT_COMMIT_MESSAGE.contains('@push')) {
                        sh 'git push origin main'
                     } else {
                        echo 'No @push in commit message, skipping push.'
                     }
                  }
               }
            }
         }
      }
   ```
3. Add GitHub credentials to Jenkins:

   * Go to `Jenkins Dashboard` > `Manage Jenkins` > `Manage Credentials`.

      ![19](./image/19.png)

   * Add a new credential with your `GitHub username` and `personal access token.`

      ![18](./image/18.png)


4. Create a new Jenkins pipeline `dso-final-pipeline`:

   * Go to `Jenkins Dashboard` > `New Item`.

   * Select `Pipeline`, name it `dso-final-pipeline`, and click `OK`.

   * In the pipeline configuration, set the following:

      - **Definition**: Pipeline script from SCM
      - **SCM**: Git
      - **Repository URL**: `https://github.com/C-gyeltshen/DSO-FinalAssignment.git`
      - **Credentials**: Select the credentials `github-credentials`
      - **Branch Specifier**: `*/main`
   * In the `Script Path`, set it to `Jenkinsfile`.

      ![20](./image/20.png)

      ![21](./image/21.png)

      kajnkandkcnsdknkzck


