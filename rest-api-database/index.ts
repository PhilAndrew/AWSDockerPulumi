import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as random from "@pulumi/random";
import { exception } from "console";

export = async () => {
    // Get the default VPC and ECS Cluster for your account.
    const vpc = awsx.ec2.Vpc.getDefault();
    const cluster = awsx.ecs.Cluster.getDefault();

    // AWS ECS cluster
    // https://github.com/pulumi/examples/blob/master/aws-ts-hello-fargate/index.ts
    const ecsCluster = new awsx.ecs.Cluster("cluster");

    const dbsubnet = new aws.rds.SubnetGroup("dbsubnet", {
        subnetIds: vpc.publicSubnetIds,
    });

    // Simple mysql database to get started
    const db = new aws.rds.Instance("mysql", {
        engine: "mysql",
        instanceClass: "db.t2.micro",
        allocatedStorage: 20,
        vpcSecurityGroupIds: cluster.securityGroups.map(g => g.id),
        dbSubnetGroupName: dbsubnet.name,
        name: "testdatabase",
        username: "testuser",
        password: "testpassword3141",
        skipFinalSnapshot: true,
    });

    const createDatabaseSchema = async (ev: any) => {
        const mysql = require('mysql-await');
        var connection = mysql.createConnection({
            host: db.endpoint.get().split(":")[0],
            port: 3306,
            user: db.username.get(),
            password: db.password.get(),
            database: "testdatabase"
        });

        connection.connect();

        const createJobsToRun = "CREATE TABLE IF NOT EXISTS `tbl_jobs_to_run` (" +
            "`job_name` VARCHAR(255) NOT NULL DEFAULT ''" +
        ");";

        const createJobsRunning = "CREATE TABLE IF NOT EXISTS `tbl_jobs_running` (" +
            "`job_name` VARCHAR(255) NOT NULL DEFAULT ''," +
            "`ec2_instance` VARCHAR(255) NOT NULL DEFAULT ''" +
        ");";

        const createJobsDone = "CREATE TABLE IF NOT EXISTS `tbl_jobs_done` (" +
            "`job_name` VARCHAR(255) NOT NULL DEFAULT ''" +
        ");";

        const createEc2 = "CREATE TABLE IF NOT EXISTS `tbl_ec2` (" +
            "`instance_name` VARCHAR(255) NOT NULL DEFAULT ''," +
            "`status` VARCHAR(255) NOT NULL DEFAULT ''" +
        ");";

        await connection.awaitBeginTransaction();
        let result1 = await connection.awaitQuery(createJobsToRun);
        let result2 = await connection.awaitQuery(createJobsRunning);
        let result3 = await connection.awaitQuery(createJobsDone);
        let result4 = await connection.awaitQuery(createEc2);
        await connection.awaitCommit();

        connection.end();
        return 'OK database tables created';
    }
    
    // https://axxnj92gf4.execute-api.us-east-2.amazonaws.com/stage/addSubmitJob?jobname=testvalue
    // 
    const addSubmitJob = async (ev: any) => {
        console.log('enviro');
        console.log(ev);
        const mysql = require('mysql-await');
        var connection = mysql.createConnection({

            host: db.endpoint.get().split(":")[0],
            port: 3306,
            user: db.username.get(),
            password: db.password.get(),
            database: "testdatabase"
        });

        connection.connect();

        const jobName = ev.queryStringParameters.jobname;
        let result = await connection.awaitQuery('INSERT INTO tbl_jobs_to_run VALUES(?)', jobName);
            //if (error) { reject(error); return }
            //console.log('The solution is: ', results[0].solution);
            //resolve("OK");
            //connection.end();
            //return "OK1";
        //});
        console.log(JSON.stringify(result));

        connection.end();

        return "jobname:" + jobName + ":" + JSON.stringify(ev);
    }

    // https://axxnj92gf4.execute-api.us-east-2.amazonaws.com/stage/querySubmitJobs
    const querySubmitJobs = async (ev: any) => {
        console.log('enviro');
        console.log(ev);
        const mysql = require('mysql-await');
        var connection = mysql.createConnection({

            host: db.endpoint.get().split(":")[0],
            port: 3306,
            user: db.username.get(),
            password: db.password.get(),
            database: "testdatabase"
        });

        connection.connect();

        let result = await connection.awaitQuery('SELECT * FROM tbl_jobs_to_run');

        connection.end();

        return JSON.stringify(result);
    }

    // ------------------------------------------------------------------------------------------
    // ------------------------------------------------------------------------------------------
    // ------------------------------------------------------------------------------------------
    // ------------------------------------------------------------------------------------------
    // ------------------------------------------------------------------------------------------
    // Rubbish after

    const queryDatabase = async (ev: any) => {
        const mysql = require('mysql-await');
        var connection = mysql.createConnection({

            host: db.endpoint.get().split(":")[0],
            port: 3306,
            user: db.username.get(),
            password: db.password.get(),
            database: "testdatabase"
        });

        connection.connect();

        console.log("querying...")
        let result = await connection.awaitQuery('DESCRIBE tbl_jobs_done');
            //if (error) { reject(error); return }
            //console.log('The solution is: ', results[0].solution);
            //resolve("OK");
            //connection.end();
            //return "OK1";
        //});
        console.log('after query');
        console.log(JSON.stringify(result));

        connection.end();

        return "OK2dddd " + JSON.stringify(result);
    }

    // https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/ec2-example-managing-instances.html
    const createEc2Instance = async(ev: any) => {
        // Do we need to set the region?
        const AWS = require("aws-sdk");
        AWS.config.update({region: 'us-east-2'});
        var ec2 = new AWS.EC2({});
        var params = {
            InstanceIds: [
            "i-1234567890abcdef0"
            ]
        };
        let data = ec2.describeInstances(params).promise();
        console.log(data);
        console.log(JSON.stringify(data));
        /*
      protocol: 'https:',
      host: 'lambda.us-east-2.amazonaws.com',
      port: 443,
      hostname: 'lambda.us-east-2.amazonaws.com',
      pathname: '/',
      path: '/',
      href: 'https://lambda.us-east-2.amazonaws.com/',
*/

        return 'STARTED EC2 INSTANCE' + data;
    }


    /*
    Build functions as follows.

    1. Create database schema idempotent.
    2. Given a Dockerfile can spin up an ECS and run that Docker file.
    3. 

    Extra points.

    1. Amazon Elastic Container Registry (ECR) can store docker file.
    2. Amazon Amazon Elastic Container Service (ECS) can run docker file.
    */

    const createLambda = (name: string, functionToCall: any) => {
        return new aws.lambda.CallbackFunction(name, {
            vpcConfig: {
                securityGroupIds: db.vpcSecurityGroupIds,
                subnetIds: vpc.publicSubnetIds,
            },
            policies: [aws.iam.ManagedPolicies.AWSLambdaVPCAccessExecutionRole, 
                aws.iam.ManagedPolicies.AWSLambdaFullAccess,
                aws.iam.ManagedPolicies.AmazonRDSDataFullAccess,
                // EC2
                aws.iam.ManagedPolicies.AmazonEC2FullAccess
            ],
            callback: async (ev) => {
                console.log(ev);
    
                let result = await functionToCall(ev);
    
                return {
                    statusCode: 200,
                    body: result,
                };
            },
        });
    } 

    // Create a Lambda within the VPC to access the Aurora DB and run the code above.
    const createDatabaseLambda = createLambda('createDatabaseLambda', createDatabaseSchema);
    const queryDatabaseLambda = createLambda('lambda', queryDatabase);
    const createEc2InstanceLambda = createLambda('createEc2Instance', createEc2Instance);
    const querySubmitJobsLambda = createLambda('querySubmitJobs', querySubmitJobs);

    const addSubmitJobLambda = createLambda('addSubmitJob', addSubmitJob);

    // Define a new GET endpoint that just returns a 200 and "hello" in the body.
    const api = new awsx.apigateway.API("example", {
        routes: [{
            path: "/queryDatabaseLambda",
            method: "GET",
            eventHandler: queryDatabaseLambda
        },
        {
            path: "/createDatabase",
            method: "GET",
            eventHandler: createDatabaseLambda            
        },
        {
            path: "/createEc2Instance",
            method: "GET",
            eventHandler: createEc2InstanceLambda            
        },
        {
            path: "/addSubmitJob",
            method: "POST",
            eventHandler: addSubmitJobLambda,
            index: false,
            requestValidator: "PARAMS_ONLY",
            requiredParameters: [{
                name: "jobname",
                in: "query",
            }]                    
        },
        {
            path: "/querySubmitJobs",
            method: "POST",
            eventHandler: querySubmitJobsLambda            
        },
        
    ],
    })
    return {
        functionArn: queryDatabaseLambda.arn,
        url: api.url
    };
}
