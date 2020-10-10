
# Typescript files running on Docker on AWS

## Introduction

`npm install` first and also make sure you have pulumi and aws and all command line as per the root README.md, etc.

This takes typescript files and runs them on AWS within docker containers, specifically Amazon Elastic Container Registry ECR and Amazon Elastic Container Service ECS providing a Docker container for each typescript file to run within. It is expected that each typescript file
 will do some work.

The typescript files must be places into the `deployscripts` folder, use a file name which is all lowercase characters
 and no spaces or special characters, just alphanumeric. If a typescript file has been removed from that folder and pulumi up has been run then that Docker container will be removed from AWS as well. View the typescript files there to understand how they can do work.

Then to deploy this to AWS do:

`pulumi up` and select yes to deploy.

After deployment has completed then the URLs of the typescripts running are outputted, by visiting the URL in the web browser then the output of the typescript file to the logs directory can be shown.

```
Outputs:
    urls: [
        [0]: "net-lb-typescriptfile1-b1ad058-1116026544.us-west-1.elb.amazonaws.com"
        [1]: "net-lb-typescriptfile2-40e6aa4-1194251500.us-west-1.elb.amazonaws.com"
    ]
```

When visiting the URL it will look as follows.

```
Results
The resulting log messages from executing the typescript job file is as follows:

[2020-10-10T10:05:03.954] [DEBUG] default - Debug message from typescriptfile1.ts
[2020-10-10T10:05:13.959] [DEBUG] default - In loop with index 0
[2020-10-10T10:05:23.960] [DEBUG] default - In loop with index 1
[2020-10-10T10:05:33.965] [DEBUG] default - In loop with index 2
[2020-10-10T10:05:43.966] [DEBUG] default - In loop with index 3
[2020-10-10T10:05:53.969] [DEBUG] default - In loop with index 4
[2020-10-10T10:06:03.973] [DEBUG] default - In loop with index 5
[2020-10-10T10:06:13.974] [DEBUG] default - In loop with index 6
```

## What does pulumi do?

When `pulumi up` has been run then it attempts to bring AWS infrastructure to match what we desire as per the index.ts file in this directory.

