import axios from 'axios';
import { expect } from 'chai';
import { UserSession, SubscribersService } from '@novu/testing';
import { SubscriberEntity } from '@novu/dal';
import { workflow } from '@novu/framework';
import { EchoServer } from '../../../../e2e/echo.server';

describe('Echo Health Check', async () => {
  let session: UserSession;
  let frameworkClient: EchoServer;
  let subscriber: SubscriberEntity;
  let subscriberService: SubscribersService;

  before(async () => {
    const healthCheckWorkflow = workflow('health-check', async ({ step }) => {
      await step.email('send-email', async (controls) => {
        return {
          subject: 'This is an email subject',
          body: 'Body result',
        };
      });
    });
    frameworkClient = new EchoServer();
    await frameworkClient.start({ workflows: [healthCheckWorkflow] });
  });

  after(async () => {
    await frameworkClient.stop();
  });

  beforeEach(async () => {
    session = new UserSession();
    await session.initialize();
    subscriberService = new SubscribersService(session.organization._id, session.environment._id);
    subscriber = await subscriberService.createSubscriber();
  });

  it('should have a status', async () => {
    const result = await axios.get(frameworkClient.serverPath + '/echo?action=health-check');

    expect(result.data.status).to.equal('ok');
  });

  it('should have a version', async () => {
    const result = await axios.get(frameworkClient.serverPath + '/echo?action=health-check');

    expect(result.data.version).to.be.a('string');
  });

  it('should return the discovered resources', async () => {
    const result = await axios.get(frameworkClient.serverPath + '/echo?action=health-check');

    expect(result.data.discovered).to.deep.equal({ workflows: 1, steps: 1 });
  });
});
