pipeline {
    agent any

    stages {

        stage('Deploy Backend') {
            steps {
                sh '''
                cd /var/www/sajdhaj.advitsoftware.com/backend

                git reset --hard

                git pull origin main

                npm install

                sudo pm2 restart sajdhaj-backend
                '''
            }
        }
    }
}