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


                        image_name="my-app-image"
                        image_tag="latest"
                        container_name="user-form-app-containerized"


                        if [ $(docker images -q ${image_name}:${image_tag}) ]; then
                            echo "Image ${image_name}:${image_tag} already exists. Removing it..."
                            docker stop ${container_name} && docker rm ${container_name}
                            docker rmi -f ${image_name}:${image_tag}
                        else
                            echo "Image ${image_name}:${image_tag} does not exist."
                        fi

                        echo "Building the new image ${image_name}:${image_tag}..."
                        docker build -t ${image_name}:${image_tag} .



                        container_name="user-form-app-containerized"
                        if [ $(docker ps -q -f name=${container_name}) ]; then
                            echo "Container is already running. Stopping it and deleting it."
                            docker stop ${container_name} && docker rm ${container_name}
                            sleep 10
                            echo "Starting New Updated Container"
                            docker run --name user-form-app-containerized -d -p 80:80 -p 3000:3000 my-app-image
                        fi
                        exit
                    EOF'''
                }
            }
        }
    }
}
