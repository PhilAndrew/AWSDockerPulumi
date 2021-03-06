
const doWork = async (logger: any) => {

    logger.level = "debug";
    logger.debug("Debug message from typescriptfile2.ts");

    for (var n = 0; n < 200; n++) {
        await new Promise(r => setTimeout(r, 10000));
        logger.debug("In loop with index " + n);
    }
    logger.debug("Finished");
}

export default doWork;

