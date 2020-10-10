import * as awsx from "@pulumi/awsx";
//import copy from 'recursive-copy';
const clonefolder = require("clonefolder");
import { promises as fs } from 'fs';
//var path = require('path'); 

export = async () => {


    const deployTypescriptJob = async(fileName: string) => {
        // Assume file is in data/ like data/typescript_file_1.ts

        const vpc = awsx.ec2.Vpc.getDefault();

        // Step 1: Create an ECS Fargate cluster.
        const fileNamePrefix = fileName.substring(0, fileName.indexOf('.'))

        const sourceFile = './deployscripts/' + fileName;
        const targetFolder = './template/temp/' + fileNamePrefix;
        const targetFile = targetFolder + '/src/task.ts';

        // Only copy the directory and file if it has been modified
        var stat: any = null;
        try {
            stat = await fs.stat(targetFolder);
        } catch (e) {
            stat = null;
        }
        if (stat == null) {
            clonefolder('./template/express-gen-ts', targetFolder);
            await fs.copyFile(sourceFile, targetFile);
        } else {
            var statSourceFile: any = null;
            var statTargetFile: any = null;
            try {
                statSourceFile = await fs.stat(sourceFile);
            } catch (e) {
                statSourceFile = null;
            }
            try {
                statTargetFile = await fs.stat(targetFile);
            } catch (e) {
                statTargetFile = null;
            }
            if (stat == null) {
                await fs.copyFile(sourceFile, targetFile);
            } else {
                if (statSourceFile.mtimeMs > statTargetFile.mtimeMs) {
                    await fs.copyFile(sourceFile, targetFile);
                }
            }
        }

        const cluster = new awsx.ecs.Cluster("cluster-" + fileNamePrefix);

        // Copy template
        // copy('./template/express-gen-ts', './template/e2');

        // Step 2: Define the Networking for our service.
        const alb = new awsx.elasticloadbalancingv2.ApplicationLoadBalancer(
            "net-lb-" + fileNamePrefix, { external: true, securityGroups: cluster.securityGroups });
        const web = alb.createListener("web" + fileNamePrefix, { port: 80, external: true });

        // Step 3: Build and publish a Docker image to a private ECR registry.
        const img = awsx.ecs.Image.fromPath("app-img" + fileNamePrefix, './template/temp/' + fileNamePrefix);

        // Step 4: Create a Fargate service task that can scale out.
        const appService = new awsx.ecs.FargateService("app-svc" + fileNamePrefix, {
            cluster,
            taskDefinitionArgs: {
                container: {
                    image: img,
                    cpu: 102, //10% of 1024
                    memory: 256, // 256 MB is minimum for NodeJS,
                    portMappings: [ web ],
                },
            },
            desiredCount: 1,
        });

        console.log(web.endpoint.hostname);

        return web.endpoint.hostname
    }

    var result = []
    const files = await fs.readdir( './deployscripts/' );
    for (const file of files) {
        result.push(await deployTypescriptJob(file));
    }
    //result.push(await deployTypescriptJob('typescriptfile2.ts'))

    // Step 5: Export the Internet address for the service.
    //export const url = web.endpoint.hostname;
    return {
        urls: result
    }
}
