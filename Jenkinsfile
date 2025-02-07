pipeline {
    agent any

    stages {
        stage('Deploying To EC2 Instance Dockerized') {
            steps {
                sshagent(['ec2-user']) {  // Make sure 'ec2-ssh-key' is your SSH private key stored in Jenkins credentials
                    // Use echo and bash to run multiple commands
                    sh '''ssh -tt -o StrictHostKeyChecking=no ec2-user@54.227.98.219 << 'EOF'
                        echo "Hello, from Target EC2!"
                        if [ ! -d "user-form-app" ]; then
                        git clone https://github.com/R3DChiLLi/user-form-app.git
                        else
                        cd user-form-app && git pull
                        fi

                        cd user-form-app/

                        docker build -t my-app-image .
                        docker run --name user-form-app-containerized -d -p 80:80 -p 3000:3000 my-app-image
                        exit
                    EOF'''
                }
            }
        }
    }
}
