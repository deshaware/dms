const router = require('express').Router();
const Directory = require('../../models/Directory');
const File = require('../../models/File');
const auth = require("../../middlewares/auth");
const validateName = require("../../services/nameValidation.service");
const { checkIfFolderExist, checkIfFileExist, getFiles, moveFileToDestinationFolder } = require('../../services/directory.service');

/**
 * @swagger
 * /file/createFile:
 *  post:
 *      summary: Creates a File
 *      description: If no folderName parameter specified, the file will be created in root folder
 *      tags:
 *          - createFile
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema: # Request body contents
 *                      type:
 *                          object
 *                      properties:
 *                          fileName:
 *                              type:
 *                                  string
 *                          fileContent:
 *                              type:
 *                                  string
 *                          folderName:
 *                              type:
 *                                  string
 *      responses:
 *          201:
 *              description: creates a file
 *          400:
 *              description: Could not create file
 *          401:
 *              description: Unauthorized
 *          422:
 *              description: Unprocessable Entity
 * 
 */
router.post('/createFile', auth, async ( req, res ) => {
    try {
        const { fileName, fileContent, folderName } = req.body;
        if(! fileName || !fileContent)
            throw new Error("Please provide valid fileName and content ");
        const { _id } = req.user;
        validateName(fileName);
        const path = folderName ? '/my-drive/' + folderName.toLowerCase() : '/my-drive';
        const folder = await Directory.findOne({ path, owner_id: _id, isDeleted: false })
        if(!folder)
            throw new Error(`${folderName} not found! You may want to create a new folder before adding a file`)
        const newFile = new File({ fileName: fileName.toLowerCase(),
            fileContent,
            parent_id: folder._id, 
            owner_id: _id,
            dir_id: folder._id,
            createdBy: _id,  
            updatedBy: _id 
        });
        await newFile.validateFileName( req.user, folder )
        await newFile.save();
        res.status(201).send({ 
            status: 'SUCCESS',
            message: 'File created Successfully',
            response: { 
                fileName: fileName.toLowerCase(),
            }
        });
    } catch (error) {
        console.log(error)
        res.status(400).send({ status: 'FAILED', message: 'Could not create file', error: error.message })
    }
});

/**
 * @swagger
 * /file/getFiles:
 *  get:
 *      summary: Gets all the files inside the folder
 *      description: Retrieve files inside the folder, If no folderName speficied, it will return file inside the root directory
 *      tags:
 *          - GetFiles
 *      parameters:
 *      - name: folderName
 *        in: 'query'
 *        description: Fetches files under specified value below
 *        required: true
 *        schema:
 *          type: string 
 *      security:
 *      - bearerAuth:
 *          - auth
 *      responses:
 *          401:
 *              description: Unauthorized
 *          400:
 *              description: Failed to retrieve files 
 *          200:
 *              description: Files and Folders retrieved successfully
 * 
 */
router.get('/getFiles/', auth, async (req, res) => {
    try {
        const { _id } = req.user;
        const { folderName } = req.query;
        if(!folderName)
            throw new Error("Please provde a valid folderName query parameter")
        const files = await getFiles(folderName.toLowerCase(), _id);
        res.status(200).send({
            status: 'SUCCESS',
            message: `Retrived all the files inside ${folderName}`,
            response: files
        })
    } catch (error) {
        console.log(error)
        res.status(400).send({ status: 'FAILED', message: 'Could not retrieve files', error: error.message })
    }
});

/**
 * @swagger
 * /file/moveFile:
 *  put:
 *      summary: Move file from soureFolder to destinationFolder
 *      description: Move the specified file, If no folderName speficied, then respective folder will be treated as root directory
 *      tags:
 *          - MoveFile
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema: # Request body contents
 *                      type:
 *                          object
 *                      properties:
 *                          fileName:
 *                              type:
 *                                  string
 *                          sourceFolder:
 *                              type:
 *                                  string
 *                          destinationFolder:
 *                              type:
 *                                  string
 *      responses:
 *          401:
 *              description: Unauthorized
 *          400:
 *              description: Could not move file 
 *          200:
 *              description: Files and Folders retrieved successfully
 * 
 */
router.put('/moveFile', auth, async ( req , res) => {
    try {
        const { _id } = req.user;
        let { fileName, sourceFolder, destinationFolder } = req.body;
        if(!fileName)
            throw new Error("Invalid Filename!")
        if(sourceFolder && ! await checkIfFolderExist(sourceFolder.toLowerCase(), _id))
            throw new Error(`${sourceFolder} does not exist`);
        if(destinationFolder && ! await checkIfFolderExist(destinationFolder.toLowerCase(), _id))
            throw new Error(`${destinationFolder} does not exist`);
        if(!await checkIfFileExist(fileName.toLowerCase(), sourceFolder ? sourceFolder.toLowerCase() : null, _id))
            throw new Error(`Could not find file "${fileName}" in ${sourceFolder}`);
        await moveFileToDestinationFolder(fileName.toLowerCase(), destinationFolder ? destinationFolder.toLowerCase(): null, _id);
        res.status(200).send({ status: 'SUCCESS', message: 'File moved Successfully'});
    } catch (error) {
        res.status(400).send({ status: 'FAILED', message: 'Could not move file', error: error.message })
    }
});

//tested
router.get('/getAllFiles', auth, async (req, res) => {
    try {
        // if no folderName provided, try to get files in root directory
        const { _id } = req.user;
        //get all folders except the home one
        let files = await File.find({
            isDeleted: false,
            owner_id: _id
        }, [
            'fileName',
            'dir_id',
            'fileContent'
        ]).populate('dir_id').exec();
        files = files.filter( file => file.dir_id.folderName.replace('/my-drive', ''))
            .map( file => {
                return {
                    fileName: file.fileName,
                    fileContent: file.fileContent,
                    folderName: file.dir_id.path === '/my-drive' ? '' : file.dir_id.folderName,
                    path: file.dir_id.path + '/' + file.fileName
                }
            });
        const response = {
            status: 'SUCCESS',
            message: 'Files and Folders retrieved successfully',
            response:{ files }
        };
        res.status(200).send(response)
    } catch (error) {
        console.log(error)
        res.status(400).send({ status: 'FAILED', error: error.message })
    }
});
module.exports = router;
