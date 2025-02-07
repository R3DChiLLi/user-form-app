pipeline {
    agent any

    stages {
        stage('SSH to Remote Server') {
            steps {
                sshagent(['ec2-user']) {  // Make sure 'ec2-ssh-key' is your SSH private key stored in Jenkins credentials
                    // Use echo and bash to run multiple commands
                    sh '''ssh -tt -o StrictHostKeyChecking=no ec2-user@54.227.98.219 << 'EOF'
                        echo "Hello, from Target EC2!"
                        git clone https://github.com/R3DChiLLi/user-form-app.git || git pull https://github.com/R3DChiLLi/user-form-app.git
                        exit
                    EOF'''
                }
            }
        }
    }
}
