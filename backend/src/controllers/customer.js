  static async getCustomerById(req, res) {
    try {
      const customer = await Customer.getCustomerById(req.params.id);
      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }
      res.json(customer);
    } catch (error) {
      console.error('Error getting customer:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async getCustomerByRFID(req, res) {
    try {
      const customer = await Customer.getCustomerByRFID(req.params.rfid);
      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }
      res.json(customer);
    } catch (error) {
      console.error('Error getting customer by RFID:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } 