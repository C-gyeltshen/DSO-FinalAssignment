pipeline {
    agent any

    environment {
        // Replace with your Jenkins credentials ID for GitHub
        GIT_CREDENTIALS_ID = 'GITHUB_CREDENTIALS'
        // Replace with your repository URL
        REPO_URL = 'https://github.com/C-gyeltshen/DSO-FinalAssignment.git'
        // Branch to push to
        BRANCH = 'main'
    }

    stages {
        stage('Checkout') {
            steps {
                // Checkout the code using Jenkins credentials
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: "*/${env.BRANCH}"]],
                    userRemoteConfigs: [[
                        url: "${env.REPO_URL}",
                        credentialsId: "${env.GIT_CREDENTIALS_ID}"
                    ]]
                ])
            }
        }

        stage('Check Commit Message') {
            steps {
                script {
                    // Get the latest commit message
                    env.GIT_COMMIT_MESSAGE = sh(
                        script: "git log -1 --pretty=%B",
                        returnStdout: true
                    ).trim()
                    echo "Latest commit message: ${env.GIT_COMMIT_MESSAGE}"
                }
            }
        }

        stage('Push to GitHub if @push') {
            when {
                expression {
                    return env.GIT_COMMIT_MESSAGE?.contains('@push')
                }
            }
            steps {
                script {
                    // Push frontend changes
                    dir('frontend') {
                        sh '''
                            git add .
                            git commit -m "Auto-push frontend changes [ci skip]"
                            git push origin ${BRANCH}
                        '''
                    }
                    // Push backend changes
                    dir('backend') {
                        sh '''
                            git add .
                            git commit -m "Auto-push backend changes [ci skip]"
                            git push origin ${BRANCH}
                        '''
                    }
                }
            }
        }

        stage('Push to GitHub if @push') {
            steps {
                dir('frontend') {
                    sh '''
                        git config user.name "jenkins"
                        git config user.email "jenkins@example.com"

                        git add .
                        if git diff --cached --quiet; then
                        echo "No changes to commit."
                        else
                        git commit -m 'Auto-push frontend changes [ci skip]'
                        echo "Changes committed."
                        fi
                    '''
                }
            }
        }
    }
}