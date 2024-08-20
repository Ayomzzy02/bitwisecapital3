const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const s3 = new S3Client({
    region: process.env.S3_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});


const getArticleDocUrl = async (objectKey) => {
    try {
        // Generate pre-signed URL for the profile image
        const getObjectParams = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: objectKey,
            Expires: 24 * 60 * 60,
        };

        const command = new GetObjectCommand(getObjectParams);
        const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

        return signedUrl;
    } catch (error) {
        // Handle errors or throw them for handling elsewhere
        throw new Error(`Error generating signed URL for profile image: ${error}`);
    }
};

module.exports = {  getArticleDocUrl }