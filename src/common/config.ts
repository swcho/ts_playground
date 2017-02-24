
type DeployTarget = 'test' | 'dev' | 'prd';

interface Config {

    /**
     * Level of deployment
     */
    level: DeployTarget;

}
