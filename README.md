
# AWS Pulumi Example of ECS and AWS Lambda for work processing

## Introduction

Docker work processing of typescript files with [Pulumi](https://www.pulumi.com/) and Amazon Elastic Container Service (ECS). Simply put, this takes typescript files which the user supplies to command line scripts and submits them to do some work. The typescript files are placed into docker images and run on AWS. This is an exploratory project to use Pulumi and AWS services such as Lambda and ECS/ECR, to see how they interact and what is a good way to control them.

This is a demonstration project for using Pulumi to create a system for running Docker containers which run typescript files. The work is done within the typescript files and when they complete their work then their docker containers are stopped and removed. A REST API is provided in AWS Lambda inside a VPC.

### Why?

[Pulumi](https://www.pulumi.com/) is an interesting tool for adminstrating AWS as Infrastructure as Code (IAC), Pulumi also works with Kubernetes and other clouds. I wanted to explore what it can do and understand any limitations for futher work.

### Problems found

I discovered some problems which I did not expect, thats good it provides for a learning opportunity.

**Problem 1:** [How to call AWS API using aws-sdk from NodeJS inside AWS Lambda within a VPC?](https://stackoverflow.com/questions/64077709/trying-to-use-aws-sdk-from-inside-nodejs-aws-lambda-does-timeout-and-not-work-w) The VPC seems to block the connection unless some setup of the network is done but I don't know what that setup needs to be. I also [asked a question here](https://forums.aws.amazon.com/thread.jspa?threadID=329225).

If I could solve that problem then most of this code could be moved to AWS Lambda and less scripting would exist on client side PC, most of the code would be in the cloud.

### Installation

Install pulumi https://www.pulumi.com/ on the command line, also need NodeJS and typescript, npm, npx and aws command line working with the correct security keys set for aws command line to work. For example in `myscripts/.env` file need access key and secret access key.

```
AWS_ACCESS_KEY_ID=???
AWS_SECRET_ACCESS_KEY=???
AWS_REGION=us-east-2
```

Some of my command line versions are:

`node --version` v14.6.0.

`npx --version` 6.14.6.

`tsc --version` 1.5.3.

## Folders

### folder myscripts

This is a a few AWS-API scripts which can be run to achieve parts of this project such as uploading files to S3 etc.

See the file myscripts/src/index.ts 

You need to set AWS API access keys in .env file.

The intent here is to get folder myscripts to be the base scripts to run from client side. The scripts should control ecr-push-docker-script by creating appropiate typescript files in its directory and running ``pulumi up`` to update the stack of running docker images.

The scripts should also call the rest-api-database project which is running on AWS to access the database and update records.

### folder ecr-push-docker-script

This demonstrates the creation of two docker images containers which are deployed and run ECR ECS. This is an alernative to running EC2 images.

What it does is that it makes two copies of the directory ecr-push-docker-script/template/express-gen-ts to other directories. What should happen then
 is that it should modify the typescript there (does not yet) with your typescript job, then it Dockerises it and deploys it. 

If you type ```pulumi up -y``` in this directory then it deploys the two. At the end it outputs the urls of the running docker images.

If you visit these URLs you can see them running.

```
 + urls: [
  +     [0]: "net-lb-typescriptfile1-310eb1a-1449732904.us-east-2.elb.amazonaws.com"
  +     [1]: "net-lb-typescriptfile2-93e364c-1074743847.us-east-2.elb.amazonaws.com"
    ]
```

### folder rest-api-database

This is a pulumi project which sets up a mysql database in a VPN and exposes a REST API via AWS Lambda running inside a VPC. See the file index.ts there.


