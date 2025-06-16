import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

async function backupAndCleanup() {
  try {
    console.log('🗄️ Starting backup and cleanup process')
    console.log('═'.repeat(60))
    
    const publicDir = path.join(process.cwd(), 'public')
    const artDir = path.join(publicDir, 'ART')
    const backupDir = path.join(process.cwd(), 'backups')
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupPath = path.join(backupDir, `art-backup-${timestamp}`)
    
    // Create backup directory
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
      console.log('📁 Created backup directory')
    }
    
    console.log(`📋 Backup location: ${backupPath}`)
    
    // Check if ART directory exists
    if (!fs.existsSync(artDir)) {
      console.log('❌ ART directory not found, nothing to backup')
      return
    }
    
    // Get directory size before backup
    console.log('📊 Calculating directory size...')
    try {
      const { stdout } = await execAsync(`du -sh "${artDir}"`)
      const dirSize = stdout.trim().split('\t')[0]
      console.log(`📦 ART directory size: ${dirSize}`)
    } catch (error) {
      console.log('⚠️ Could not calculate directory size')
    }
    
    // Count files before backup
    const countFiles = (dir: string): number => {
      let count = 0
      const items = fs.readdirSync(dir)
      
      for (const item of items) {
        const fullPath = path.join(dir, item)
        const stat = fs.statSync(fullPath)
        
        if (stat.isDirectory()) {
          count += countFiles(fullPath)
        } else {
          count++
        }
      }
      return count
    }
    
    const totalFiles = countFiles(artDir)
    console.log(`📄 Total files to backup: ${totalFiles}`)
    
    // Create backup using cp command for better performance
    console.log('🔄 Creating backup...')
    await execAsync(`cp -R "${artDir}" "${backupPath}"`)
    console.log('✅ Backup created successfully!')
    
    // Verify backup
    if (fs.existsSync(backupPath)) {
      const backupFiles = countFiles(backupPath)
      console.log(`✅ Backup verification: ${backupFiles} files backed up`)
      
      if (backupFiles !== totalFiles) {
        throw new Error(`Backup verification failed: ${backupFiles} ≠ ${totalFiles}`)
      }
    } else {
      throw new Error('Backup directory not found after creation')
    }
    
    console.log('\n🗑️ Starting cleanup process...')
    console.log('─'.repeat(40))
    
    // Ask for confirmation before deletion
    console.log('⚠️  DANGER ZONE: About to delete original ART directory')
    console.log(`📁 Directory: ${artDir}`)
    console.log(`📄 Files: ${totalFiles}`)
    console.log(`💾 Backup: ${backupPath}`)
    
    // For automated script, we'll proceed with deletion
    // In interactive mode, you might want to add a prompt here
    
    console.log('🗑️ Removing original ART directory...')
    await execAsync(`rm -rf "${artDir}"`)
    
    // Verify deletion
    if (!fs.existsSync(artDir)) {
      console.log('✅ Original ART directory successfully removed')
    } else {
      throw new Error('Failed to remove original ART directory')
    }
    
    console.log('\n' + '═'.repeat(60))
    console.log('🎉 BACKUP AND CLEANUP COMPLETED!')
    console.log('═'.repeat(60))
    console.log(`✅ Backup created: ${backupPath}`)
    console.log(`✅ Original directory removed: ${artDir}`)
    console.log(`📄 Files backed up: ${totalFiles}`)
    console.log('💡 You can restore from backup if needed using:')
    console.log(`   cp -R "${backupPath}" "${artDir}"`)
    
    // Create a restore script
    const restoreScript = `#!/bin/bash
# Restore script generated on ${new Date().toISOString()}
# Usage: bash restore-art-backup.sh

echo "🔄 Restoring ART directory from backup..."
cp -R "${backupPath}" "${artDir}"
echo "✅ Restore completed!"
`
    
    const restoreScriptPath = path.join(backupDir, 'restore-art-backup.sh')
    fs.writeFileSync(restoreScriptPath, restoreScript)
    fs.chmodSync(restoreScriptPath, '755')
    console.log(`📜 Restore script created: ${restoreScriptPath}`)
    
  } catch (error) {
    console.error('❌ Backup and cleanup failed:', error)
    throw error
  }
}

// Run if this file is executed directly
if (require.main === module) {
  backupAndCleanup()
    .then(() => {
      console.log('\n🏁 Backup and cleanup completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Backup and cleanup failed:', error)
      process.exit(1)
    })
}

export default backupAndCleanup