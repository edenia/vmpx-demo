VMPX Demo

# Instructions:

## Setup Docker repo
```
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

## Install packages
```
sudo apt update 
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common npm docker-ce
```
## Setup docker-compose
```
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
docker-compose --version
```
## Allow $USER (you) to use docker
```
sudo groupadd docker
sudo usermod -aG docker $USER
```
## Start docker with system
```
sudo systemctl enable docker.service
sudo systemctl enable containerd.service
```

## Install NVM
```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.4/install.sh | bash
```
## Activate NVM in terminal
```
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
```

## Install Hasura
```
curl -L https://github.com/hasura/graphql-engine/raw/stable/cli/get.sh | bash
```

## Install Node 16
```
nvm install 16
```
## Install Yarn and pm2
```
npm install --global yarn pm2
```
# Running
```
run cp .env.example .env
replace the values of .env with the ones I just shared with you.
run make run
cd webapp
pm2 start "yarn start:local | cat"
```

## Get ETH on Goerli
To get eth on Goerli you can use this faucet
https://goerlifaucet.com/

## Get Goerli VMPX
Once you got eth, you can go here and call the mint function to get some fake evmpx token
https://goerli.etherscan.io/address/0xAf5c20De8FEb9d9C0980C4974a8692dE37F8b46c#writeContract

## Import MTYVMPX token in metamask
Show MTYVMPX in Metamask by importing this contract
`0xAf5c20De8FEb9d9C0980C4974a8692dE37F8b46c`

# More info:
This address `0xAF1b081600b839849e96e5f0889078D14dd1C960` represents the target address where we are going to be listening for vmpx transfers.
