
import AWS from 'aws-sdk';
import S3 from 'aws-sdk/clients/s3';
import fs from 'fs';
import * as rra from 'recursive-readdir-async';
const {request} = require('gaxios');

require('dotenv').config();

const region = 'us-east-2';
const REST_API_BASE = 'https://axxnj92gf4.execute-api.us-east-2.amazonaws.com/stage/';

const app = async () => {

    const queryEc2InstanceDetails = async() => {
        AWS.config.update({region: region});
        var ec2 = new AWS.EC2({});
        var params = {
            InstanceIds: [
            "i-05b640d56552f2704" // Instance id of a running AWS instance
            ]
        };
        let data = await ec2.describeInstances(params).promise();
        console.log('describe instances');
        console.log(JSON.stringify(data));
    }

    const stopEc2Instance = async() => {
        AWS.config.update({region: region});
        var ec2 = new AWS.EC2({});
        var params = {
            InstanceIds: [
            "i-05b640d56552f2704" // Instance id of a running AWS instance
            ]
        };
        console.log('stop instances');
        let data = await ec2.stopInstances(params).promise();
        console.log(JSON.stringify(data));
    }

    const startEc2Instance = async() => {
        AWS.config.update({region: region});
        var ec2 = new AWS.EC2({});
        var params = {
            InstanceIds: [
            "i-05b640d56552f2704" // Instance id of a running AWS instance
            ]
        };
        console.log('start instances');
        let data = await ec2.startInstances(params).promise();
        console.log(JSON.stringify(data));
    }

    const listBucketsS3 = async() => {
        AWS.config.update({region: region});

                
        // Create S3 service object
        const s3 = new AWS.S3({apiVersion: '2006-03-01'});

        // Call S3 to list the buckets
        s3.listBuckets(function(err, data) {
        if (err) {
            console.log("Error", err);
        } else {
            console.log("Success", data.Buckets);
        }
        });
    }

    // Create S3 Bucket
    const createS3Bucket = async(name: string) => {
        AWS.config.update({region: region});
                
        // Create S3 service object
        const s3 = new AWS.S3({apiVersion: '2006-03-01'});

        var bucketParams = {
            Bucket : name
          };

        // Call S3 to list the buckets
        let data = await s3.createBucket(bucketParams).promise();
        console.log(data);
    }


    const uploadFileToS3 = async(bucketName: string, fileNameInBucket: string, filePath: string) => {
        AWS.config.update({region: region});
                
        // Create S3 service object
        const s3 = new AWS.S3({apiVersion: '2006-03-01'});

        // Call S3 to list the buckets
        let stream = fs.readFileSync(filePath);
        var params = {Bucket: bucketName, Key: fileNameInBucket, Body: stream};
        let data = await s3.upload(params).promise();
        console.log(data);
    }


    const listFilesInS3Bucket = async(bucketName: string) => {
        AWS.config.update({region: region});
                
        // Create S3 service object
        const s3 = new AWS.S3({apiVersion: '2006-03-01'});

        var bucketParams = {
            Bucket : bucketName
          };

        // Call S3 to list the buckets
        let data = await s3.listObjectsV2(bucketParams).promise();
        console.log(data);

        /*
        {
        IsTruncated: false,
        Contents: [
            {
            Key: 'testtypescript.ts',
            LastModified: 2020-09-27T10:13:21.000Z,
            ETag: '"9f06243abcb89c70e0c331c61d871fa7"',
            Size: 6,
            StorageClass: 'STANDARD'
            }
        ],
        Name: 'dfjkdfkldsfkjphilhkskskskdeleteme4',
        Prefix: '',
        MaxKeys: 1000,
        CommonPrefixes: [],
        KeyCount: 1
        }*/
    }

    

    const listFilesInS3BucketDirectory = async(bucketName: string, directory: string) => {
        AWS.config.update({region: region});
                
        // Create S3 service object
        const s3 = new AWS.S3({apiVersion: '2006-03-01'});

        var bucketParams = {
            Bucket : bucketName,
            Prefix: directory
          };

        // Call S3 to list the buckets
        let data = await s3.listObjectsV2(bucketParams).promise();
  
        let result = []

        for (var n = 0; n < data.Contents.length; n++) {
            const d = data.Contents[n];
            const fileName = d.Key;
            if (! fileName.endsWith('/')) {
                const l = fileName.substring(fileName.lastIndexOf('/') + 1);
                result.push(l);
                console.log(l);
            }
        }

        return result;

        /*
        {
        IsTruncated: false,
        Contents: [
            {
            Key: 'testtypescript.ts',
            LastModified: 2020-09-27T10:13:21.000Z,
            ETag: '"9f06243abcb89c70e0c331c61d871fa7"',
            Size: 6,
            StorageClass: 'STANDARD'
            }
        ],
        Name: 'dfjkdfkldsfkjphilhkskskskdeleteme4',
        Prefix: '',
        MaxKeys: 1000,
        CommonPrefixes: [],
        KeyCount: 1
        }*/
    }

    const createDirectoryInS3 = async(bucketName: string, directoryName: string) => {
        AWS.config.update({region: region});
                
        // Create S3 service object
        const s3 = new AWS.S3({apiVersion: '2006-03-01'});

        // Call S3 to list the buckets
        //let stream = fs.readFileSync(filePath);
        var params = {Bucket: bucketName, Key: directoryName, Body: ''};
        let data = await s3.upload(params).promise();
        console.log(data);
    }

    const uploadFolderRecursiveToS3 = async(bucketName: string, folderPath: string) => {
        AWS.config.update({region: region});
                
        // Create S3 service object
        const s3 = new AWS.S3({apiVersion: '2006-03-01'});

        const options = {
            mode: rra.LIST,
            recursive: true,
            stats: false,
            deep: false,
            realPath: false,
            normalizePath: true,
            include: [],
            exclude: [],
            ignoreFolders: false
        }
        const list = await rra.list('./foo', options);

        for (var n = 0; n < list.length; n++) {
            const it: any = list[n]
            console.log(it)
            let name = it.name
            let path = it.path
            let fullname = it.fullname
            let isDirectory = it.isDirectory
            if (isDirectory) {
                // Drop ./
                let path2 = fullname.substring(2) + '/'
                await createDirectoryInS3(bucketName, path2)
            } else {
                let path2 = fullname.substring(2)
                await uploadFileToS3(bucketName, path2, fullname)
            }
        }

        console.log('done');

        /*var bucketParams = {
            Bucket : fileNameInBucket
          };

        // Call S3 to list the buckets
        let stream = fs.readFileSync(filePath);
        var params = {Bucket: bucketName, Key: fileNameInBucket, Body: stream};
        let data = await s3.upload(params).promise();
        console.log(data);*/
    }

    const transferS3ScriptsToJobsToRunDatabase = async(bucketName: string) => {
        AWS.config.update({region: region});
                
        const files = await listFilesInS3BucketDirectory(bucket, 'foo/scripts');

        for (var n = 0; n < files.length; n++) {
            let f = files[n];

            // Do http request
            
            let url = REST_API_BASE + 'addSubmitJob?jobname=' + encodeURIComponent(f)
            console.log(url)
            const res = await request({url: url, method: 'POST'});
        }
    }

    const querySubmittedJobs = async() => {
        //https://axxnj92gf4.execute-api.us-east-2.amazonaws.com/stage/querySubmitJobs
        let url = REST_API_BASE + 'querySubmitJobs'
        const res = await request({url: url, method: 'POST'});
        const data = res.data;
        console.log('submitted jobs in database is');
        console.log(data);
    }

    const updateFargateWithJobs = async() => {
        const fargatePath = process.cwd() + '/../ecr-push-docker-script';
        
    }

    let bucket = 'dfjkdfkldsfkjphilhkskskskdeleteme4';

    //await queryEc2InstanceDetails();
    //await stopEc2Instance();
    //await startEc2Instance();
    //await createS3Bucket(bucket);
    //await uploadFileToS3(bucket, 'testtypescript.ts', './testtypescript.ts');
    //await listBucketsS3();
    //await listFilesInS3Bucket(bucket);
    //await uploadFolderRecursiveToS3(bucket, './foo');
    //await createDirectoryInS3(bucket, 'somedir1/');
    //await transferS3ScriptsToJobsToRunDatabase(bucket)
    //await listFilesInS3BucketDirectory(bucket, 'foo/scripts/')
    //await querySubmittedJobs()
    await updateFargateWithJobs()
}

app();


