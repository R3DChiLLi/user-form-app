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

def buildBackEndImage() {
    return """
    cd backend
    docker build -t 205930633177.dkr.ecr.us-east-1.amazonaws.com/user-form-app-ecr-repo:backend .
    aws ecr get-login-password | docker login --username AWS --password-stdin ${env.AWS_ECR_REPOSITORY}
    docker push 205930633177.dkr.ecr.us-east-1.amazonaws.com/user-form-app-ecr-repo:backend
    """
}


def buildFrontEndImage() {
    return """
    cd ../frontend/
    docker build -t 205930633177.dkr.ecr.us-east-1.amazonaws.com/user-form-app-ecr-repo:frontend .
    aws ecr get-login-password | docker login --username AWS --password-stdin ${env.AWS_ECR_REPOSITORY}
    docker push 205930633177.dkr.ecr.us-east-1.amazonaws.com/user-form-app-ecr-repo:frontend
    """
}

def runDockerCompose() {
    return '''
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
    '''
}

def executeShellScriptForSubstitutingPubIP() {
    return """
    cd frontend/
    chmod 700 change-pub-ip.sh
    ./change-pub-ip.sh
    """
}


pipeline {
    agent any

    environment {
        CLUSTER_NAME = 'user-form-app-cluster'
        SERVICE_NAME = 'user-form-service'
        TASK_DEFINITION = 'task-def-user-form-app'
        REPO_NAME = 'user-form-app-ecr-repo'
    }

    options {
        disableConcurrentBuilds()
    }

    stages {
        // stage ('Get EC2 Public IP addr')
        // {
        //     agent {
        //         docker {
        //             image 'amazon/aws-cli'
        //             args "-u root --rm --entrypoint='' --network=host"
        //             reuseNode true
        //         }
        //     }
        //     steps {
        //         script {
        //         sh '''
        //         yum install jq -y
        //         '''
        //         env.PUB_IP=sh(script: "aws cloudformation describe-stacks --stack-name user-form-app-project | jq -r '.Stacks[0].Outputs[0].OutputValue'", returnStdout: true).trim()
        //         }
        //     }
        // }

        stage('Build Custom Images') {
            steps {
                sh """
                cd custom-images
                docker build -t my-aws-cli .
                """
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

        stage('Get Env Variables') {
            agent {
                docker {
                    image 'my-aws-cli'
                    args "-u root --rm --entrypoint='' --network=host"
                    reuseNode true
                }
            }
            steps {
                script {
                    sh """
                    yum install jq -y
                    """
                    env.AWS_ECR_REPOSITORY = sh(script: "aws ecr describe-repositories | jq -r '.repositories[0].repositoryUri' | cut -d'/' -f1", returnStdout: true)
                }
            }
        }

        // stage('Build') {
        //     steps {
        //         sh """
        //         echo 'repo name is: ${env.AWS_ECR_REPOSITORY}'
        //         """
        //     }
        // }

        stage('Changing Nginx Conf to ALB DNS') {
            agent {
                docker {
                    image 'my-aws-cli'
                    args "-u root --entrypoint='' --network=host"
                    reuseNode true
                }
            }
            steps {
                sh'''
                cd frontend
                current_DNS=$(aws elbv2 describe-load-balancers | jq -r '.LoadBalancers[0].DNSName')
                sed -i "s|###enterALBDNShere###|${current_ip}|g" nginx.conf
                '''
            }
        }
        stage('Build The Images And Push to ECR') {
            agent {
                docker {
                    image 'my-aws-cli'
                    args "-u root -v /var/run/docker.sock:/var/run/docker.sock --entrypoint='' --network=host"
                    reuseNode true
                }
            }
            steps {
                sh """
                ${buildBackEndImage()}
                ${buildFrontEndImage()}
                """
            }
        }

        stage('Update Task Def and Update Service') {
            agent {
                docker {
                    image 'my-aws-cli'
                    args "-u root -v /var/run/docker.sock:/var/run/docker.sock --entrypoint='' --network=host"
                    reuseNode true
                }
            }
            steps {
                sh '''
                REVISION_VALUE=$(aws ecs register-task-definition --cli-input-json file://aws/task-def-user-form-app | jq '.taskDefinition.revision')
                aws ecs update-service --cluster ${CLUSTER_NAME} --service ${SERVICE_NAME} --task-definition ${TASK_DEFINITION}:$REVISION_VALUE
                aws ecs wait services-stable --cluster user-form-app-cluster --services user-form-service
                '''
            }
        }


        // stage('Deploying To EC2 Instance Dockerized') {
        //     steps {
        //         sshagent(['ec2-user']) {
        //             // Use echo and bash to run multiple commands
        //             sh """ssh -q -tt -o StrictHostKeyChecking=no ec2-user@${env.PUB_IP} << 'EOF'
        //                 echo "Hello, from Target EC2!"
        //                 ${updateGitRepo()} >> /tmp/log1.txt
        //                 ${executeShellScriptForSubstitutingPubIP ()} >> /tmp/log2.txt
        //                 ${runDockerCompose()} >> /tmp/log3.txt
        //                 exit
        //             EOF"""
        //         }
        //     }
        // }
    }
}