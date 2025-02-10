// def checkStackStatus() {
//     // Retrieve the stack status using AWS CLI and jq
//     env.STATUS = sh(script: "aws cloudformation describe-stacks --stack-name user-form-app-project | jq -r '.Stacks[0].StackStatus'", returnStdout: true).trim()
    
//     echo "Current CloudFormation Stack Status: ${env.STATUS}"
    
//     // Abort the pipeline if the stack is not stable
//     if (env.STATUS != "CREATE_COMPLETE" && env.STATUS != "UPDATE_COMPLETE") {
//         error("Stack is not stable (state: ${env.STATUS}). Aborting deployment.")
//     }
    
//     return env.STATUS
// }

def updateGitRepo() {
    return '''
    if [ ! -d "user-form-app" ]; then
        git clone -q https://github.com/R3DChiLLi/user-form-app.git
    else
        cd user-form-app && git pull
    fi
    cd user-form-app
    '''
}

def buildDockerImage() {
    return '''
    image_name="my-app-image"
    image_tag="latest"
    container_name="user-form-app-containerized"

    if [ $(docker images -q ${image_name}:${image_tag}) ]; then
        echo "Image ${image_name}:${image_tag} already exists. Removing it..."
        docker stop ${container_name} && docker rm ${container_name}
        docker system prune -a -f
    else
        echo "Image ${image_name}:${image_tag} does not exist."
    fi

    echo "Building the new image ${image_name}:${image_tag}..."
    docker build -q -t ${image_name}:${image_tag} .
    cd user-form-app/
    '''
}

def runContainer() {
    return '''
    container_name="user-form-app-containerized"
    if [ $(docker ps -q -f name=${container_name}) ]; then
        echo "Container is already running. Stopping it and deleting it."
        docker stop ${container_name} && docker rm ${container_name}
        sleep 10
        echo "Starting New Updated Container"
        docker run --name user-form-app-containerized -d -p 80:80 -p 3000:3000 my-app-image
    else
        docker run --name user-form-app-containerized -d -p 80:80 -p 3000:3000 my-app-image
    fi
    '''
}

def executeShellScriptForSubstitutingPubIP () {
    return '''
    chmod 777 change-pub-ip.sh
    ./change-pub-ip.sh
    '''
}


pipeline {
    agent any

    stages {
        stage ('Get EC2 Public IP addr')
        {
            agent {
                docker {
                    image 'amazon/aws-cli'
                    args "-u root --rm --entrypoint='' --network=host"
                    reuseNode true
                }
            }
            steps {
                script {
                sh '''
                yum install jq -y
                '''
                env.PUB_IP=sh(script: "aws cloudformation describe-stacks --stack-name user-form-app-project | jq -r '.Stacks[0].Outputs[0].OutputValue'", returnStdout: true).trim()
                }
            }
        }

        stage('Checking Stability of CF') {
            steps {
                sh '''
                    status=$(aws cloudformation describe-stacks --stack-name user-form-app-project | jq -r '.Stacks[0].StackStatus')
                    echo "Current CloudFormation Stack Status: ${status}"
                    if [ "$status" = "CREATE_COMPLETE" ] || [ "$status" = "UPDATE_COMPLETE" ]; then
                        echo "Stack is stable."
                    else
                        echo "Stack is not stable (status: ${status}). Aborting deployment." >&2
                        exit 1
                    fi
                '''
            }
        }


        stage('Deploying To EC2 Instance Dockerized') {
            steps {
                sshagent(['ec2-user']) {  // Make sure 'ec2-ssh-key' is your SSH private key stored in Jenkins credentials
                    // Use echo and bash to run multiple commands
                    sh """ssh -q -tt -o StrictHostKeyChecking=no ec2-user@${env.PUB_IP} << 'EOF'
                        echo "Hello, from Target EC2!"
                        ${updateGitRepo()} >> /tmp/log1.txt
                        ${executeShellScriptForSubstitutingPubIP ()} >> /tmp/log2.txt
                        ${buildDockerImage()} >> /tmp/log3.txt
                        ${runContainer()} >> /tmp/log4.txt
                        exit
                    EOF"""
                }
            }
        }
    }
}




