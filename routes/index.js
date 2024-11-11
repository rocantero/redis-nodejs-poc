const express = require('express');

const router = express.Router();

const appController = require('../controllers/appController');

/*
GET home page.
*/
router.get(
  '/',
  appController.getIndexPage,
);

router.get('/locations/:locationId', appController.getCachedWeatherData);
router.get('/test', appController.testCron);

module.exports = router;
