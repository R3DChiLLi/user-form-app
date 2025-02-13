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

def runDockerCompose() {
    return """
    if [ "$(docker images -q)" ]; then
        echo "Images already exists. Removing it..."
        docker-compose down
        docker system prune -a -f
    else
        echo "Images does not exist."
    fi

    echo "Building the new images..."
    cd user-form-app/
    docker-compose up -d
    """
}

def executeShellScriptForSubstitutingPubIP () {
    return '''
    cd frontend/
    chmod 700 change-pub-ip.sh
    ./change-pub-ip.sh
    '''
}


pipeline {
    agent any

    options {
        disableConcurrentBuilds()
    }

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
            agent {
                docker {
                    image 'amazon/aws-cli'
                    args "-u root --rm --entrypoint='' --network=host"
                    reuseNode true
                }
            }

            steps {
                sh '''
                yum install jq -y
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
                sshagent(['ec2-user']) {
                    // Use echo and bash to run multiple commands
                    sh """ssh -q -tt -o StrictHostKeyChecking=no ec2-user@${env.PUB_IP} << 'EOF'
                        echo "Hello, from Target EC2!"
                        ${updateGitRepo()} >> /tmp/log1.txt
                        ${executeShellScriptForSubstitutingPubIP ()} >> /tmp/log2.txt
                        ${runDockerCompose()} >> /tmp/log3.txt
                        exit
                    EOF"""
                }
            }
        }
    }
}




