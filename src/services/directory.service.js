const Directory = require('../models/Directory');
const File = require('../models/File')

const checkIfFolderExist = async (folderName, _id) => {
    return await Directory.findOne({ folderName, owner_id:_id, path: { $ne: '/my-drive' }, isDeleted:false });
}

const checkIfFileExist = async( fileName, folderName, _id) => {
    const folder = folderName ? 
        (await Directory.findOne({ folderName, owner_id:_id, isDeleted:false }))
        : ( await Directory.findOne({ path: '/my-drive', owner_id:_id, isDeleted:false }) 
        );
    const file = await File.findOne({ fileName, owner_id:_id, isDeleted:false }, ['dir_id']).populate('dir_id').exec();
    console.log(folder)
    console.log(file)
    return (folder._id.id.toString() === file.dir_id._id.id.toString());
}

const moveFileToDestinationFolder = async ( fileName, folderName, _id ) => {
    //check if already sameFileName exists for the user
    const folder = folderName ? 
        (await Directory.findOne({ folderName, owner_id:_id, isDeleted:false }))
        : ( await Directory.findOne({ path: '/my-drive', owner_id:_id, isDeleted:false }) 
        );
    const file = await File.findOne({ fileName, owner_id:_id, isDeleted:false }, ['dir_id']).populate('dir_id').exec()
    if(folder._id.id.toString() === file.dir_id._id.id.toString()){
        throw new Error(`${fileName} already exists in the destination folder`);
    }
    await File.findOneAndUpdate({ _id: file._id }, { $set: { dir_id: folder._id }});
    return;
}

const getFiles = async(folderName , _id) => {
    const folder = await Directory.findOne({ folderName, owner_id:_id, isDeleted:false });
    if(!folder)
        throw new Error(`Folder ${folderName} does not exist`)
    let files = await File.find({
        isDeleted: false,
        owner_id: _id,
        dir_id: { $eq: folder._id}
    }, [
        'fileName',
        'dir_id',
        'fileContent'
    ]).populate('dir_id').exec();
    files = files.map( file => {
        return {
            fileName: file.fileName,
            fileContent: file.fileContent,
            folderName: file.dir_id.path === '/my-drive' ? '' : file.dir_id.folderName,
            path: file.dir_id.path + '/' + file.fileName
        }
    });
    return files;
}

module.exports = { checkIfFolderExist, checkIfFileExist, getFiles, moveFileToDestinationFolder };