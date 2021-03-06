#!/usr/bin/python
# -*- coding: utf-8 -*-

# pylint: disable=C0111

# Copyright (c) 2012 Nelen & Schuurmans.  GPL licensed, see LICENSE.rst.

from UserList import UserList
from unittest import TestCase

import os

from django.conf import settings

from mock import Mock

from lizard_area.models import Area
from lizard_portal.configurations_retriever import AttributesFromNameRetriever
from lizard_portal.configurations_retriever import ConfigurationsRetriever
from lizard_portal.configurations_retriever import ConfigurationSpecRetriever
from lizard_portal.configurations_retriever import ConfigurationStore
from lizard_portal.configurations_retriever import DescriptionParser
from lizard_portal.configurations_retriever import ZipFileNameRetriever
from lizard_portal.models import ConfigurationToValidate
from lizard_security.models import DataSet


class MockQuerySet(UserList):

    def __init__(*args, **kwargs):
        UserList.__init__(*args, **kwargs)

    def all(self):
        return self.data

    def filter(self, *args, **kwargs):
        result = MockQuerySet()
        for o in self.data:
            print o.action
            is_searched_object = True
            for keyword, value in kwargs.items():
                print keyword, value
                is_searched_object = getattr(o, keyword) == value
                if not is_searched_object:
                    break
            if is_searched_object:
                result.append(o)
        return result

    def get(self, *args, **kwargs):
        result = None
        for o in self.data:
            is_searched_object = True
            for keyword, value in kwargs.items():
                lookup = '__iexact'
                length = len(lookup)
                if keyword[-length:] == lookup:
                    attribute_value = getattr(o, keyword[:-length]).lower()
                    value = value.lower()
                else:
                    attribute_value = getattr(o, keyword)
                is_searched_object = attribute_value == value
                if not is_searched_object:
                    break
            if is_searched_object:
                result = o
                break
        if result is None:
            assert False
        return result

    def count(self):
        return len(self.data)


class MockQuerySetTestSuite(TestCase):

    def test_a(self):
        """Test a case-sensitive call to MockQuerySet.get that is succeeds."""
        data_set = DataSet()
        data_set.name = 'Waternet'

        query_set = MockQuerySet()
        query_set.append(data_set)

        found_data_set = query_set.get(name='Waternet')
        self.assertEqual(found_data_set, data_set)

    def test_b(self):
        """Test a case-sensitive call to MockQuerySet.get that fails."""
        data_set = DataSet()
        data_set.name = 'Waternet'

        query_set = MockQuerySet()
        query_set.append(data_set)

        self.assertRaises(AssertionError, query_set.get, name='waternet')

    def test_c(self):
        """Test a case-insensitive call to MockQuerySet.get that succeeds."""
        data_set = DataSet()
        data_set.name = 'Waternet'

        query_set = MockQuerySet()
        query_set.append(data_set)

        found_data_set = query_set.get(name__iexact='waternet')
        self.assertEqual(found_data_set, data_set)

    def test_d(self):
        """Test a case-insensitive call to MockQuerySet.get that succeeds."""
        data_set = DataSet()
        data_set.name = 'Waternet'

        query_set = MockQuerySet()
        query_set.append(data_set)

        found_data_set = query_set.get(name__iexact='Waternet')
        self.assertEqual(found_data_set, data_set)


class MockDatabase(object):

    def __init__(self):
        self.areas = MockQuerySet()
        self.configurations = MockQuerySet()
        self.data_sets = MockQuerySet()

    def ConfigurationToValidate(self):
        config = ConfigurationToValidate()
        config.db = self
        config.save = lambda c=config: self.configurations.append(c)
        return config

    def Area(self):
        area = Area()
        area.save = lambda a=area: self.areas.append(a)
        return area

    def DataSet(self):
        data_set = DataSet()
        data_set.save = lambda d=data_set: self.data_sets.append(d)
        return data_set


class ConfigurationsRetrieverTestSuite(TestCase):

    def setUp(self):
        self.db = MockDatabase()

    def test_a(self):
        """Test no configurations are retrieved.

        There are no configurations to validate.

        """
        retriever = ConfigurationsRetriever()
        retriever.db = self.db
        self.assertEqual([], retriever.retrieve_configurations())

    def test_b(self):
        """Test a single configuration is retrieved."""
        config = self.db.ConfigurationToValidate()
        config.save()
        retriever = ConfigurationsRetriever()
        retriever.db = self.db
        self.assertEqual([config], retriever.retrieve_configurations())


class ZipFileNameRetrieverTestSuite(TestCase):

    def test_a(self):
        """Test no files are returned when there are no files present."""
        retriever = ZipFileNameRetriever()
        retriever.retrieve_file_names = (lambda : [])
        file_names = retriever.retrieve()
        self.assertEqual([], file_names)

    def test_b(self):
        """Test no files are returned when there are no zip files present."""
        retriever = ZipFileNameRetriever()
        retriever.retrieve_file_names = (lambda : ['hello.txt'])
        file_names = retriever.retrieve()
        self.assertEqual([], file_names)

    def test_c(self):
        """Test the single zip file is returned."""
        retriever = ZipFileNameRetriever()
        retriever.retrieve_file_names = (lambda : ['hello.zip'])
        file_names = retriever.retrieve()
        self.assertEqual(['hello.zip'], file_names)


class DescriptionParserTestSuite(TestCase):

    def setup(self, *lines):
        self.parser = DescriptionParser()
        open_file = Mock()
        open_file.readlines = Mock(return_value=lines)
        self.parser.open = Mock(return_value=open_file)

    def test_a(self):
        """Test that an option value that contains a space is parsed."""
        self.setup('naam = nieuwe oppervlakte')
        description_dict = self.parser.as_dict('/path/to/description.txt')
        self.assertEqual({'naam': 'nieuwe oppervlakte'}, description_dict)

    def test_b(self):
        """Test that multiple options are parsed."""
        lines = 'naam = nieuwe oppervlakte', 'gebruiker = Pieter Swinkels'
        self.setup(*lines)
        description_dict = self.parser.as_dict('/path/to/description.txt')
        self.assertEqual(2, len(description_dict))
        self.assertEqual('nieuwe oppervlakte', description_dict['naam'])
        self.assertEqual('Pieter Swinkels', description_dict['gebruiker'])

    def test_c(self):
        """Test that trailing spaces of a value are removed."""
        self.setup('naam = nieuwe oppervlakte  ')
        description_dict = self.parser.as_dict('/path/to/description.txt')
        self.assertEqual('nieuwe oppervlakte', description_dict['naam'])

    def test_d(self):
        """Test that an invalid option is not parsed."""
        self.setup('naam nieuwe oppervlakte')
        description_dict = self.parser.as_dict('/path/to/description.txt')
        self.assertEqual({}, description_dict)

    def test_e(self):
        """Test that an attribute name is lowercased."""
        self.setup('Naam = nieuwe oppervlakte')
        description_dict = self.parser.as_dict('/path/to/description.txt')
        self.assertEqual('nieuwe oppervlakte', description_dict['naam'])

    def test_f(self):
        """Test that attribute values can contain non-alphanumeric characters.
        """
        self.setup('datum = 08-03-2012 20:13:00')
        description_dict = self.parser.as_dict('/path/to/description.txt')
        self.assertEqual('08-03-2012 20:13:00', description_dict['datum'])


class NoSelf(object):

    pass


class Self(object):

    def get_self(self):
        return self


class OverrideSelf(object):

    def get_self(self):
        return self


class OverrideSelfTestSuite(TestCase):

    def test_a(self):
        """Test replace a method by a method changes self."""
        s = Self()
        self.assertEqual(s, s.get_self())
        o = OverrideSelf()
        s.get_self = o.get_self
        self.assertEqual(o, s.get_self())

    def test_b(self):
        """Test replace a method by a function with a self argument fails."""
        s = Self()
        self.assertEqual(s, s.get_self())
        s.get_self = get_self
        try:
            self.assertEqual(s, s.get_self())
            self.assertTrue(False)
        except TypeError:
            pass

    def test_c(self):
        """Test replace a method by a function with a self argument."""
        NoSelf.get_self = get_self
        s = NoSelf()
        self.assertEqual(s, s.get_self())
        print "type(s.get_self)", type(s.get_self)
        print "s.get_self", s.get_self
        print "s.__dict__", s.__dict__
        self.assertEqual(s, s.get_self())

    def test_d(self):
        """Test replace a method by a function without a self argument."""
        s = Self()
        self.assertEqual(s, s.get_self())
        global global_s
        global_s = s
        s.get_self = get_self_c
        self.assertEqual(s, s.get_self())


def get_self(self):
    return self

global_s = None

def get_self_c():
    return global_s


class ConfigurationStoreTestSuite(TestCase):

    def setUp(self):
        self.db = MockDatabase()
        area = self.db.Area()
        area.ident = '3201'
        area.save()
        data_set = self.db.DataSet()
        data_set.name = 'Waternet'
        data_set.save()
        self.store = ConfigurationStore()
        self.store.db = self.db
        self.store.extract = Mock()
        self.store.delete = Mock()
        self.store.retrieve_zip_names = lambda : ['waterbalans_Waternet_04042012_081400.zip']
        self.store.retrieve_attrs_from_config = lambda dir_name, config_type: [{'area_code': '3201'}]

    def get_file_path(self, zip_name):
        return os.path.join(settings.DBF_ROOT, zip_name)

    def test_a(self):
        """Test the creation of a single ConfigurationToValidate."""
        self.store.supply()
        self.assertEqual(1, self.db.configurations.count())

    def test_b(self):
        """Test the file path of the new ConfigurationToValidate is correct.

        The zip name does not contain a path.

        """
        self.store.supply()
        config = self.db.configurations.all()[0]
        self.assertEqual(self.get_file_path('waterbalans_Waternet_04042012_081400'),
            config.file_path)

    def test_c(self):
        """Test the file path of the new ConfigurationToValidate is correct.

        The zip name contains a path.

        """
        self.store.retrieve_zip_names = lambda : ['/mnt/vss-shared/te-valideren-configuraties/waterbalans_Waternet_04042012_081400.zip']
        self.store.supply()
        config = self.db.configurations.all()[0]
        self.assertEqual(self.get_file_path('waterbalans_Waternet_04042012_081400'),
            config.file_path)

    def test_d(self):
        """Test the area of the new ConfigurationToValidate is correct."""
        self.store.supply()
        config = self.db.configurations.all()[0]
        self.assertEqual(self.db.areas.all()[0], config.area)

    def test_e(self):
        """Test the config type of the new ConfigurationToValidate is correct."""
        self.store.supply()
        config = self.db.configurations.all()[0]
        self.assertEqual('waterbalans', config.config_type)

    def test_f(self):
        """Test the water manager of the new ConfigurationToValidate is correct."""
        self.store.supply()
        config = self.db.configurations.all()[0]
        self.assertEqual('Waternet', config.data_set.name)

    def test_g(self):
        """Test the action of the new ConfigurationToValidate is correct."""
        self.store.supply()
        config = self.db.configurations.all()[0]
        self.assertEqual(ConfigurationToValidate.KEEP, config.action)

    def test_h(self):
        """Test retrieve_attrs_from_config is called correctly."""
        self.store.retrieve_attrs_from_config = Mock(return_value=self.store.retrieve_attrs_from_config("don't care", "don't care"))
        self.store.supply()
        args, kwargs = self.store.retrieve_attrs_from_config.call_args
        self.assertEqual(self.get_file_path('waterbalans_Waternet_04042012_081400'), args[0])
        self.assertEqual('waterbalans', args[1])

    def test_i(self):
        """Test the zip file is deleted as soon as it has been handled."""
        self.store.supply()
        args, kwargs = self.store.delete.call_args
        self.assertEqual('waterbalans_Waternet_04042012_081400.zip', args[0])

    def test_j(self):
        """Test a zip file that is named incorrectly, is skipped."""
        self.store.retrieve_zip_names = lambda : ['incorrectly named.zip']
        self.store.supply()
        self.assertFalse(self.store.extract.called)


class AttributesFromNameRetrieverTestSuite(TestCase):

    def setUp(self):
        self.zip_name = \
            'mnt/vss-share/waterbalans_Waternet_20120228_141234.zip'

    def test_a(self):
        """Test the retrieval of the file_path."""
        retriever = AttributesFromNameRetriever()
        retriever.dbf_directory = '/tmp'
        attrs = retriever.retrieve(self.zip_name)
        self.assertEqual('/tmp/waterbalans_Waternet_20120228_141234',
            attrs['file_path'])

    def test_b(self):
        """Test the retrieval of the configuration type."""
        retriever = AttributesFromNameRetriever()
        attrs = retriever.retrieve(self.zip_name)
        self.assertEqual('waterbalans', attrs['config_type'])

    def test_c(self):
        """Test the retrieval of the configuration type."""
        retriever = AttributesFromNameRetriever()
        zip_name = 'mnt/vss-share/ESF_1_Waternet_20120228_141234.zip'
        attrs = retriever.retrieve(zip_name)
        self.assertEqual('esf1', attrs['config_type'])

    def test_d(self):
        """Test the retrieval of the water manager."""
        retriever = AttributesFromNameRetriever()
        zip_name = 'mnt/vss-share/ESF_1_Waternet_20120228_141234.zip'
        attrs = retriever.retrieve(zip_name)
        self.assertEqual('Waternet', attrs['data_set'])


class ConfigurationSpecRetrieverTestSuite(TestCase):

    def setUp(self):
        self.retriever = ConfigurationSpecRetriever()
        self.retriever.retrieve_area_codes = Mock(return_value=['3201'])
        self.retriever.retrieve_meta_info = Mock(return_value={'user': 'Pieter Swinkels'})

    def test_a(self):
        """Test the construction of a single ConfigurationSpec."""
        dir_name = '/path/to/configuration/directory'
        config_type = 'waterbalans'
        config_specs = self.retriever.retrieve(dir_name, config_type)
        self.assertEqual(1, len(config_specs))
        self.assertEqual('3201', config_specs[0]['area_code'])

    def test_b(self):
        """Test retrieve_area_codes_from_dbf is called correctly."""
        dir_name = '/path/to/configuration/directory'
        config_type = 'waterbalans'
        self.retriever.retrieve(dir_name, config_type)
        args, kwargs = self.retriever.retrieve_area_codes.call_args
        self.assertEqual('/path/to/configuration/directory/aanafvoer_waterbalans.dbf', args[0])

    def test_c(self):
        """Test retrieve_area_codes_from_dbf is called correctly."""
        dir_name = '/path/to/configuration/directory'
        config_type = 'esf1'
        self.retriever.retrieve(dir_name, config_type)
        args, kwargs = self.retriever.retrieve_area_codes.call_args
        self.assertEqual('/path/to/configuration/directory/aanafvoer_esf1.dbf', args[0])

    def test_d(self):
        """Test the retrieval of the 'user' attribute."""
        dir_name = '/path/to/configuration/directory'
        config_type = 'waterbalans'
        config_specs = self.retriever.retrieve(dir_name, config_type)
        self.assertEqual(1, len(config_specs))
        self.assertEqual('Pieter Swinkels', config_specs[0]['user'])

    def test_e(self):
        """Test retrieva_meta_info receives the right parameters."""
        dir_name = '/path/to/configuration/directory'
        config_type = 'waterbalans'
        self.retriever.retrieve(dir_name, config_type)
        args, kwargs = self.retriever.retrieve_meta_info.call_args
        self.assertEqual('/path/to/configuration/directory/description.txt', args[0])
