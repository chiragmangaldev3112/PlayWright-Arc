pipeline {
    agent any
    
    environment {
        NODE_VERSION = '18'
        PLAYWRIGHT_BROWSERS_PATH = '/opt/ms-playwright'
    }
    
    parameters {
        choice(
            name: 'TEST_SUITE',
            choices: ['all', 'web', 'api', 'mobile', 'smoke', 'regression'],
            description: 'Select test suite to run'
        )
        choice(
            name: 'BROWSER',
            choices: ['chromium', 'firefox', 'webkit', 'all'],
            description: 'Select browser for testing'
        )
        choice(
            name: 'ENVIRONMENT',
            choices: ['staging', 'production', 'dev'],
            description: 'Select environment to test against'
        )
        booleanParam(
            name: 'HEADLESS',
            defaultValue: true,
            description: 'Run tests in headless mode'
        )
        string(
            name: 'WORKERS',
            defaultValue: '4',
            description: 'Number of parallel workers'
        )
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    env.BUILD_TIMESTAMP = sh(
                        script: 'date +%Y%m%d_%H%M%S',
                        returnStdout: true
                    ).trim()
                }
            }
        }
        
        stage('Setup Node.js') {
            steps {
                script {
                    def nodeHome = tool name: "NodeJS-${NODE_VERSION}", type: 'nodejs'
                    env.PATH = "${nodeHome}/bin:${env.PATH}"
                }
                sh 'node --version'
                sh 'npm --version'
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
                sh 'npx playwright install --with-deps'
            }
        }
        
        stage('Lint & Format Check') {
            steps {
                sh 'npm run lint'
                sh 'npm run format:check'
            }
            post {
                failure {
                    echo 'Code quality checks failed. Please fix linting and formatting issues.'
                }
            }
        }
        
        stage('Setup Environment') {
            steps {
                script {
                    // Copy environment-specific configuration
                    sh "cp .env.example .env.${params.ENVIRONMENT}"
                    
                    // Set environment variables based on parameters
                    writeFile file: '.env.local', text: """
NODE_ENV=${params.ENVIRONMENT}
HEADLESS=${params.HEADLESS}
MAX_WORKERS=${params.WORKERS}
BASE_URL=${getBaseUrl(params.ENVIRONMENT)}
API_BASE_URL=${getApiBaseUrl(params.ENVIRONMENT)}
BROWSER_TIMEOUT=60000
RETRIES=2
"""
                }
                
                // Create necessary directories
                sh '''
                    mkdir -p test-results
                    mkdir -p playwright-report
                    mkdir -p screenshots
                    mkdir -p logs
                    mkdir -p allure-results
                '''
            }
        }
        
        stage('Run Tests') {
            parallel {
                stage('Web Tests') {
                    when {
                        anyOf {
                            expression { params.TEST_SUITE == 'all' }
                            expression { params.TEST_SUITE == 'web' }
                        }
                    }
                    steps {
                        script {
                            def browserFlag = params.BROWSER == 'all' ? '' : "--project=${params.BROWSER}"
                            sh "npx playwright test --grep @web ${browserFlag} --workers=${params.WORKERS}"
                        }
                    }
                    post {
                        always {
                            archiveArtifacts artifacts: 'test-results/**/*', allowEmptyArchive: true
                            archiveArtifacts artifacts: 'screenshots/**/*', allowEmptyArchive: true
                        }
                    }
                }
                
                stage('API Tests') {
                    when {
                        anyOf {
                            expression { params.TEST_SUITE == 'all' }
                            expression { params.TEST_SUITE == 'api' }
                        }
                    }
                    steps {
                        sh "npx playwright test --grep @api --workers=${params.WORKERS}"
                    }
                    post {
                        always {
                            archiveArtifacts artifacts: 'test-results/**/*', allowEmptyArchive: true
                        }
                    }
                }
                
                stage('Mobile Tests') {
                    when {
                        anyOf {
                            expression { params.TEST_SUITE == 'all' }
                            expression { params.TEST_SUITE == 'mobile' }
                        }
                    }
                    steps {
                        sh "npx playwright test --grep @mobile --workers=${params.WORKERS}"
                    }
                    post {
                        always {
                            archiveArtifacts artifacts: 'test-results/**/*', allowEmptyArchive: true
                            archiveArtifacts artifacts: 'screenshots/**/*', allowEmptyArchive: true
                        }
                    }
                }
            }
            post {
                always {
                    // Generate HTML report
                    sh 'npx playwright show-report --host 0.0.0.0'
                    
                    // Archive test artifacts
                    archiveArtifacts artifacts: 'playwright-report/**/*', allowEmptyArchive: true
                    archiveArtifacts artifacts: 'logs/**/*', allowEmptyArchive: true
                }
            }
        }
        
        stage('Generate Reports') {
            parallel {
                stage('HTML Report') {
                    steps {
                        publishHTML([
                            allowMissing: false,
                            alwaysLinkToLastBuild: true,
                            keepAll: true,
                            reportDir: 'playwright-report',
                            reportFiles: 'index.html',
                            reportName: 'Playwright HTML Report',
                            reportTitles: 'Test Results'
                        ])
                    }
                }
                
                stage('JUnit Report') {
                    steps {
                        script {
                            if (fileExists('reports/junit.xml')) {
                                junit 'reports/junit.xml'
                            }
                        }
                    }
                }
                
                stage('Allure Report') {
                    steps {
                        script {
                            if (fileExists('allure-results')) {
                                allure([
                                    includeProperties: false,
                                    jdk: '',
                                    properties: [],
                                    reportBuildPolicy: 'ALWAYS',
                                    results: [[path: 'allure-results']]
                                ])
                            }
                        }
                    }
                }
            }
        }
        
        stage('Quality Gates') {
            steps {
                script {
                    // Read test results and apply quality gates
                    def testResults = readJSON file: 'test-results/results.json'
                    def passRate = (testResults.passed / testResults.total) * 100
                    
                    echo "Test Pass Rate: ${passRate}%"
                    
                    if (passRate < 95) {
                        error "Test pass rate (${passRate}%) is below the required threshold of 95%"
                    }
                    
                    if (testResults.failed > 0) {
                        unstable "Some tests failed. Please review the test results."
                    }
                }
            }
        }
    }
    
    post {
        always {
            // Clean up workspace
            cleanWs()
        }
        
        success {
            script {
                def message = """
✅ **Playwright Tests Passed Successfully**
- Environment: ${params.ENVIRONMENT}
- Test Suite: ${params.TEST_SUITE}
- Browser: ${params.BROWSER}
- Build: ${env.BUILD_NUMBER}
- Duration: ${currentBuild.durationString}
"""
                sendNotification(message, 'success')
            }
        }
        
        failure {
            script {
                def message = """
❌ **Playwright Tests Failed**
- Environment: ${params.ENVIRONMENT}
- Test Suite: ${params.TEST_SUITE}
- Browser: ${params.BROWSER}
- Build: ${env.BUILD_NUMBER}
- Duration: ${currentBuild.durationString}
- View Report: ${env.BUILD_URL}Playwright_HTML_Report/
"""
                sendNotification(message, 'failure')
            }
        }
        
        unstable {
            script {
                def message = """
⚠️ **Playwright Tests Completed with Issues**
- Environment: ${params.ENVIRONMENT}
- Test Suite: ${params.TEST_SUITE}
- Browser: ${params.BROWSER}
- Build: ${env.BUILD_NUMBER}
- Duration: ${currentBuild.durationString}
- View Report: ${env.BUILD_URL}Playwright_HTML_Report/
"""
                sendNotification(message, 'warning')
            }
        }
    }
}

// Helper functions
def getBaseUrl(environment) {
    switch(environment) {
        case 'production':
            return 'https://app.production.com'
        case 'staging':
            return 'https://app.staging.com'
        case 'dev':
            return 'https://app.dev.com'
        default:
            return 'https://app.staging.com'
    }
}

def getApiBaseUrl(environment) {
    switch(environment) {
        case 'production':
            return 'https://api.production.com'
        case 'staging':
            return 'https://api.staging.com'
        case 'dev':
            return 'https://api.dev.com'
        default:
            return 'https://api.staging.com'
    }
}

def sendNotification(message, status) {
    // Slack notification
    if (env.SLACK_WEBHOOK_URL) {
        def color = status == 'success' ? 'good' : (status == 'warning' ? 'warning' : 'danger')
        slackSend(
            channel: '#qa-automation',
            color: color,
            message: message,
            webhookUrl: env.SLACK_WEBHOOK_URL
        )
    }
    
    // Email notification
    if (env.EMAIL_RECIPIENTS) {
        def subject = "Playwright Tests - ${status.toUpperCase()} - Build #${env.BUILD_NUMBER}"
        emailext(
            to: env.EMAIL_RECIPIENTS,
            subject: subject,
            body: message,
            mimeType: 'text/plain'
        )
    }
}
